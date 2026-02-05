import React, { useState, FormEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiInfo,
  FiDownload,
  FiDatabase,
  FiSettings,
  FiLock,
  FiCheckCircle,
  FiChevronRight,
  FiActivity,
  FiWifi,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstitutionalConstraintsSection from "../components/molecules/InstitutionalConstraintsSection";
import { constraintService } from "../services/api/constraintService";
import { examSettingsService } from "../services/api/examSettingsService";
import { staffService } from "../services/api/staffService";
import { studentService } from "../services/api/studentService";
import { courseService } from "../services/api/courseService";
import { venueService } from "../services/api/venueService";
import { generalSettingsService } from "../services/api/generalSettingsService";
import { GeneralSettings } from "../types/institutional";
import { useAuthStore } from "../services/state/authStore";

interface OptimizationParameter {
  checked: boolean;
  value: string;
}
interface OptimizationAlgo {
  checked: boolean;
  parameters: any;
}

const TABS = [
  { id: "general", label: "General Orchestration", icon: "🌐" },
  { id: "constraint", label: "Constraint Settings", icon: "🔒" },
  { id: "examination", label: "Examination Settings", icon: "📝" },
  { id: "output", label: "Output Settings", icon: "🖨️" },
  { id: "optimization", label: "Optimization Settings", icon: "⚙️" },
  { id: "health", label: "Health & Integrity", icon: "🏥" },
] as const;

const OPTIMIZATION_OPTS = [
  {
    key: "tabuSearch",
    label: "Tabu Search",
    description: "Avoids revisiting solutions to escape local optima",
  },
  {
    key: "geneticAlgorithm",
    label: "Genetic Algorithm",
    description: "Evolutionary approach using selection and mutation",
  },
  {
    key: "Hybrid",
    label: "Hybrid (TS-GA)",
    description: "Combines Tabu Search and Genetic Algorithm",
  },
];

// Mock data for courses and venues (in production, these come from API)
const mockCourses = [
  { code: "CHM102", title: "Chemistry II - Organic Chemistry" },
  { code: "CHM101", title: "Chemistry I - General Chemistry" },
  { code: "PHY101", title: "Physics I - Mechanics" },
  { code: "PHY102", title: "Physics II - Waves & Light" },
  { code: "MTH101", title: "Mathematics I - Calculus" },
  { code: "MTH102", title: "Mathematics II - Linear Algebra" },
  { code: "CSC101", title: "Computer Science I - Programming" },
  { code: "CSC102", title: "Computer Science II - Data Structures" },
  { code: "GST101", title: "General Studies I" },
  { code: "GST102", title: "General Studies II" },
];

const mockVenues = [
  { code: "ELT", name: "Electronics Laboratory" },
  { code: "LAB", name: "Science Laboratory" },
  { code: "HAL", name: "Lecture Hall A" },
  { code: "OFF", name: "Office Complex" },
  { code: "GYM", name: "Sports Complex" },
  { code: "AUDI", name: "Main Auditorium" },
];

/**
 * Institutional Configuration Page
 * Refactored from the SettingsPanel modal to a first-class page.
 * Enforces institutional design and professional calibration surfaces.
 */
const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.roleCode === "AD" || user?.roleId === 1;
  const [activeTab, setActiveTab] = useState<string>(
    isAdmin ? "general" : "health",
  );

  // Filter tabs: Admin sees all, Others see ONLY Health & Integrity
  const visibleTabs = isAdmin
    ? TABS
    : TABS.filter((tab) => tab.id === "health");

  // General Orchestration State
  const [generalSettings, setGeneralSettings] = useState<
    Partial<GeneralSettings>
  >({
    daysPerWeek: 5,
    periodsPerDay: 8,
    semester: "",
    session: "",
    startDate: "",
    endDate: "",
    examCategory: "Regular",
    campusType: "Single",
    examLevel: "All",
    examWeeks: 2,
  });
  const [generalHistory, setGeneralHistory] = useState<GeneralSettings[]>([]);
  const [constraintHistory, setConstraintHistory] = useState<any[]>([]);
  const [currentConstraints, setCurrentConstraints] = useState<
    Record<string, string>
  >({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showGeneralHistoryModal, setShowGeneralHistoryModal] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);

  React.useEffect(() => {
    if (isAdmin) {
      loadGeneralSettings();
      loadLatestConstraints();
      loadAssets();
    }
  }, [isAdmin]);

  const loadAssets = async () => {
    try {
      const [courseData, venueData] = await Promise.all([
        courseService.getAll(),
        venueService.getAll(),
      ]);
      setCourses(courseData);
      setVenues(venueData);
    } catch (error) {
      console.error("Failed to load assets", error);
    }
  };

  const loadLatestConstraints = async () => {
    try {
      const data = await constraintService.getLatest();
      if (data) {
        // Remove ID and Date from the mapping
        const { id, date, name, ...rest } = data as any;
        setCurrentConstraints(rest);
      }
    } catch (err) {
      console.error("Failed to load constraints", err);
    }
  };

  const loadGeneralSettings = async () => {
    try {
      const data = await generalSettingsService.get();
      if (data) {
        setGeneralSettings(data);
      }
    } catch (error) {
      console.error("Failed to load general settings", error);
    }
  };

  // Automated Exam Duration Calculation
  React.useEffect(() => {
    if (generalSettings.startDate && generalSettings.endDate) {
      const start = new Date(generalSettings.startDate);
      const end = new Date(generalSettings.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
        if (diffDays > 0) {
          const calculatedWeeks = Math.ceil(diffDays / 7);
          if (generalSettings.examWeeks !== calculatedWeeks) {
            setGeneralSettings((prev) => ({
              ...prev,
              examWeeks: calculatedWeeks,
            }));
          }
        }
      }
    }
  }, [generalSettings.startDate, generalSettings.endDate]);

  const loadGeneralHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await generalSettingsService.getHistory();
      setGeneralHistory(data);
      setShowGeneralHistoryModal(true);
    } catch (error) {
      console.error("Failed to load general history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadConstraintHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await constraintService.getHistory();
      setConstraintHistory(data);
    } catch (error) {
      console.error("Failed to load constraint history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveGeneralSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await generalSettingsService.update(generalSettings);
      toast.success("Academic configuration saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save configuration");
    }
  };

  const [constraints, setConstraints] = useState<
    Record<string, { checked: boolean; values: string[] }>
  >({});
  const [optimize, setOptimize] = useState<Record<string, OptimizationAlgo>>({
    tabuSearch: { checked: false, parameters: {} },
    geneticAlgorithm: {
      checked: false,
      parameters: {
        population: { checked: false, value: "" },
        Operationcount: { checked: false, value: "" },
        CrossOverType: { checked: false, value: "" },
        TournamentType: { checked: false, value: "" },
        adaptAll: false,
      },
    },
    Hybrid: { checked: false, parameters: {} },
  });

  // Examination State
  const [examPolicy, setExamPolicy] = useState("");
  const [maxExamL, setMaxExamL] = useState("");
  const [minExamL, setMinExamL] = useState("");
  const [examLevel, setExamLevel] = useState("");

  // Output State
  const [mixExams, setMixExams] = useState(false);
  const [moreSpace, setMoreSpace] = useState(false);
  const [largeExam, setLargeExam] = useState(false);
  const [halfSpace, setHalfSpace] = useState(false);
  const [skipWeek, setSkipWeek] = useState(false);
  const [sitting, setSitting] = useState(false);
  const [studentStaff, setStudentStaff] = useState("");
  const [staffInv, setStaffInv] = useState("");
  const [staffRandom, setStaffRandom] = useState(false);
  const [staffUpdate, setStaffUpdate] = useState(false);
  const [saveTTc, setSaveTTc] = useState(false);
  const [saveTTp, setSaveTTp] = useState(false);

  // General Optimization State
  const [displayProg, setDisplayProg] = useState(false);
  const [optTime, setOptTime] = useState("");
  const [optCount, setOptCount] = useState("");

  // Health & Heartbeat State
  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [checkingHealth, setCheckingHealth] = useState(false);

  const fetchHealth = async () => {
    setCheckingHealth(true);
    const endpoints = [
      { id: "staff", name: "Personnel Ledger", service: staffService },
      { id: "student", name: "Student Registry", service: studentService },
      { id: "course", name: "Curriculum Assets", service: courseService },
      { id: "venue", name: "Infrastructure Portfolio", service: venueService },
    ];

    const results: Record<string, any> = {};

    for (const ep of endpoints) {
      try {
        const data = await ep.service.getAll();
        results[ep.id] = {
          status: "Connected",
          ok: true,
          name: ep.name,
          count: Array.isArray(data) ? data.length : 0,
        };
      } catch (e) {
        console.error(`Health check failed for ${ep.id}`, e);
        results[ep.id] = {
          status: "Offline",
          ok: false,
          name: ep.name,
          count: 0,
        };
      }
    }
    setHealthData(results);
    setCheckingHealth(false);
    toast.info("Institutional health audit complete");
  };

  const handleOptimizationToggle = (key: string) => {
    setOptimize((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        checked: !prev[key].checked,
      },
    }));
  };

  // New save function for refactored constraints section
  const saveConstraintsToDB = async (constraints: Record<string, string>) => {
    try {
      // Prepare data in the format expected by the backend
      const constraintData: any = {
        periodIncE: constraints.periodIncE || "",
        periodExcE: constraints.periodExcE || "",
        venueIncE: constraints.venueIncE || "",
        venueExcE: constraints.venueExcE || "",
        periodIncV: constraints.periodIncV || "",
        periodExcV: constraints.periodExcV || "",
        examWAftE: constraints.examWAftE || "",
        examExcE: constraints.examExcE || "",
      };

      await constraintService.saveAll(constraintData);
      toast.success("All institutional constraints saved successfully");
      return Promise.resolve();
    } catch (error: any) {
      toast.error(
        error.message || "Failed to save constraints to institutional ledger",
      );
      return Promise.reject(error);
    }
  };

  const saveExamSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await examSettingsService.create({
        schedule_policy: examPolicy,
        max_examl: maxExamL,
        min_examl: minExamL,
        exam_level_high_limit: examLevel,
      });
      toast.success("Academic examination boundaries established");
    } catch (error: any) {
      toast.error(error.message || "Boundary synchronization failed");
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-page/95 backdrop-blur-sm border-b border-brick/10 pb-2 flex justify-between transition-all">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-institutional-primary tracking-tight">
            System Calibration
          </h1>
          <p className="text-[10px] text-institutional-secondary font-medium italic opacity-70">
            Configuration Core • Institutional Parameter Orchestration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Navigation Column */}
        <div className="lg:col-span-1 space-y-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-institutional border transition-all ${
                activeTab === tab.id
                  ? "bg-brick text-white border-brick shadow-lg shadow-brick/20"
                  : "bg-surface text-institutional-primary border-brick/5 hover:border-brick/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-black uppercase tracking-widest">
                  {tab.label}
                </span>
              </div>
              <FiChevronRight
                className={`transition-transform ${activeTab === tab.id ? "rotate-90" : ""}`}
              />
            </button>
          ))}
        </div>

        {/* Dynamic Content Column */}
        <div className="lg:col-span-3 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-surface p-6 rounded-institutional border border-brick/10 shadow-sm"
            >
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiActivity className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Global Configuration
                    </h2>
                  </div>
                  <form
                    onSubmit={saveGeneralSettings}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Academic Framework */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                        Academic Framework
                      </h3>
                      <div className="input-group">
                        <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                          Academic Session
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2025/2026"
                          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                          value={generalSettings.session || ""}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              session: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                          Semester
                        </label>
                        <select
                          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                          value={generalSettings.semester || ""}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              semester: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Semester</option>
                          <option value="1">1st Semester (Harmattan)</option>
                          <option value="2">2nd Semester (Rain)</option>
                        </select>
                      </div>
                    </div>

                    {/* Load Determinants */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                        Load Dimensions
                      </h3>
                      <div className="input-group">
                        <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                          Days Per Week
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="7"
                          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                          value={generalSettings.daysPerWeek || 7}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              daysPerWeek: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                          Periods Per Day
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                          value={generalSettings.periodsPerDay || 2}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              periodsPerDay: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Temporal Constraints */}
                    <div className="col-span-2 space-y-4 border-t border-brick/5 pt-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                        Temporal Constraints
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="input-group">
                          <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                            Commencement Date
                          </label>
                          <input
                            type="date"
                            className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                            value={
                              generalSettings.startDate
                                ?.toString()
                                .split("T")[0] || ""
                            }
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                startDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                            Termination Date
                          </label>
                          <input
                            type="date"
                            className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                            value={
                              generalSettings.endDate
                                ?.toString()
                                .split("T")[0] || ""
                            }
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advanced Institutional Context */}
                    <div className="col-span-2 space-y-4 border-t border-brick/5 pt-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                        Institutional Calibration
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="input-group">
                          <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                            Exam Category
                          </label>
                          <select
                            className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                            value={generalSettings.examCategory || "Regular"}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                examCategory: e.target.value,
                              })
                            }
                          >
                            <option value="Regular">Regular</option>
                            <option value="TopUp">TopUp</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Online">Online</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                            Campus Type
                          </label>
                          <select
                            className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                            value={generalSettings.campusType || "Single"}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                campusType: e.target.value,
                              })
                            }
                          >
                            <option value="Single">Single Campus</option>
                            <option value="Multi">Multi-Campus</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                            Exam Level
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 100,200 or All"
                            className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                            value={generalSettings.examLevel || "All"}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                examLevel: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label className="block text-[10px] font-bold uppercase text-institutional-secondary mb-1">
                            Calculated Duration
                          </label>
                          <div className="w-full bg-brick/5 border border-brick/10 px-4 py-3 rounded font-black text-brick text-sm flex items-center justify-between">
                            <span>{generalSettings.examWeeks || 0} WEEKS</span>
                            <span className="text-[9px] opacity-60 uppercase">
                              Auto-Calibrated
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 pt-4 border-t border-brick/5 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => {
                          loadGeneralHistory();
                          setShowGeneralHistoryModal(true);
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-institutional-muted border-b border-dashed border-institutional-muted hover:text-brick hover:border-brick transition-all"
                      >
                        {generalHistory.length > 0
                          ? "Open History Modal"
                          : "View History"}
                      </button>
                      {isAdmin && (
                        <button
                          type="submit"
                          className="px-8 py-3 bg-brick text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-brick/20 hover:scale-105 transition-all"
                        >
                          Save Configuration
                        </button>
                      )}
                    </div>
                  </form>

                  {/* General History Modal */}
                  {showGeneralHistoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                      <div className="bg-page rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 border border-brick/10">
                        <div className="flex items-center justify-between border-b border-brick/5 pb-3">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                            Snapshot History (Latest First)
                          </h3>
                          <button
                            onClick={() => setShowGeneralHistoryModal(false)}
                            className="text-institutional-muted hover:text-brick transition-colors"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                        {generalHistory.length === 0 ? (
                          <p className="text-sm text-institutional-muted text-center py-4">
                            No history found.
                          </p>
                        ) : (
                          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                            {generalHistory.map((h) => (
                              <div
                                key={h.id}
                                className="flex items-center justify-between p-3 bg-surface border border-brick/5 rounded group hover:border-brick/20 transition-all"
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-institutional-primary">
                                    {h.session} -{" "}
                                    {h.semester === "1" ? "Harmattan" : "Rain"}
                                  </span>
                                  <span className="text-[9px] text-institutional-muted font-medium">
                                    ID: {h.id} • {h.examCategory} •{" "}
                                    {h.examWeeks} Weeks
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setGeneralSettings(h);
                                    toast.info(
                                      `Loaded configuration from ID: ${h.id}`,
                                    );
                                    setShowGeneralHistoryModal(false); // Close modal after restoring
                                  }}
                                  className="px-3 py-1 bg-brick/5 text-brick text-[9px] font-black uppercase tracking-widest rounded hover:bg-brick hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                  Restore
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "constraint" && (
                <InstitutionalConstraintsSection
                  onSaveAll={saveConstraintsToDB}
                  onLoadHistory={constraintService.getHistory}
                  availableCourses={courses.map((c) => ({
                    code: c.code,
                    title: c.title,
                  }))}
                  availableVenues={venues.map((v) => ({
                    code: v.venueCode,
                    name: v.name,
                  }))}
                  maxPeriods={10}
                  initialConstraints={currentConstraints}
                  readOnly={!isAdmin}
                />
              )}

              {activeTab === "examination" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiCheckCircle className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Academic Boundaries
                    </h2>
                  </div>
                  <form
                    onSubmit={saveExamSettings}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Schedule Policy Architecture
                      </label>
                      <input
                        type="text"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={examPolicy}
                        onChange={(e) => setExamPolicy(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Max Capacity Tier
                      </label>
                      <input
                        type="number"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={maxExamL}
                        onChange={(e) => setMaxExamL(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 col-span-2">
                      {isAdmin && (
                        <button
                          type="submit"
                          className="px-10 py-3 bg-brick text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-brick/20 hover:scale-105 transition-all"
                        >
                          Authorize Parameters
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "output" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiDownload className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Output Projections
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        label: "Deterministic Venue Mixing",
                        checked: mixExams,
                        setter: setMixExams,
                      },
                      {
                        label: "Global Space Optimization",
                        checked: moreSpace,
                        setter: setMoreSpace,
                      },
                      {
                        label: "Buffer Management (50%)",
                        checked: halfSpace,
                        setter: setHalfSpace,
                      },
                      {
                        label: "Skip Week Protocol",
                        checked: skipWeek,
                        setter: setSkipWeek,
                      },
                    ].map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-center justify-between p-3 bg-page/50 rounded border border-brick/5 cursor-pointer hover:border-brick/10"
                      >
                        <span className="text-xs font-bold text-institutional-primary">
                          {opt.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={opt.checked}
                          onChange={(e) => opt.setter(e.target.checked)}
                          className="w-4 h-4 accent-brick"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "optimization" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiSettings className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Mathematical Orchestration
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {OPTIMIZATION_OPTS.map((algo) => (
                      <div
                        key={algo.key}
                        className="p-5 bg-page/50 rounded border border-brick/10"
                      >
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={optimize[algo.key].checked}
                            onChange={() => handleOptimizationToggle(algo.key)}
                            className="w-5 h-5 accent-brick"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-widest text-institutional-primary">
                              {algo.label}
                            </span>
                            <span className="text-[10px] font-medium text-institutional-muted italic">
                              {algo.description}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "health" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-brick/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brick/5 rounded-full flex items-center justify-center">
                        <FiActivity className="text-brick" size={14} />
                      </div>
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                          System Connectivity & Health
                        </h2>
                        <p className="text-[9px] text-institutional-muted font-bold tracking-tight">
                          Real-time heartbeat monitor for academic services
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={fetchHealth}
                      disabled={checkingHealth}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-institutional border text-[10px] font-black uppercase tracking-widest transition-all ${
                        checkingHealth
                          ? "bg-brick/5 text-brick opacity-50 cursor-not-allowed"
                          : "bg-brick text-white hover:bg-brick-deep shadow-lg shadow-brick/20"
                      }`}
                    >
                      <FiRefreshCw
                        className={checkingHealth ? "animate-spin" : ""}
                      />
                      {checkingHealth ? "Auditing..." : "Execute Pulse Check"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Endpoint Status */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-institutional-muted pl-1">
                        Service Heartbeats
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(healthData).map(
                          ([id, data]: [string, any]) => (
                            <div
                              key={id}
                              className="flex items-center justify-between p-3 bg-page/50 border border-brick/5 rounded-institutional group hover:border-brick/20 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`p-2 rounded-full ${data.ok ? "bg-status-success/10 text-status-success" : "bg-status-error/10 text-status-error"}`}
                                >
                                  <FiWifi size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-institutional-primary">
                                    {data.name}
                                  </p>
                                  <p className="text-[9px] text-institutional-muted uppercase font-black">
                                    {id} endpoint
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${data.ok ? "bg-status-success text-white" : "bg-status-error text-white"}`}
                                >
                                  {data.status}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                        {Object.keys(healthData).length === 0 && (
                          <div className="py-12 text-center border-2 border-dashed border-brick/5 rounded-institutional opacity-40 italic text-xs">
                            Execute pulse check to verify connectivity.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Registry Insights */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-institutional-muted pl-1">
                        Registry Population
                      </h3>
                      <div className="bg-brick/5 p-5 rounded-institutional border border-brick/10 relative overflow-hidden">
                        <FiDatabase className="absolute -right-4 -bottom-4 text-brick/10 w-20 h-20 rotate-12" />
                        <div className="grid grid-cols-2 gap-3 relative z-10">
                          {Object.entries(healthData).map(
                            ([id, data]: [string, any]) => (
                              <div
                                key={id}
                                className={`p-4 rounded border shadow-sm transition-all ${data.count > 0 ? "bg-transparent border-brick/10" : "bg-status-warning/5 border-status-warning/20"}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-[9px] font-black uppercase text-brick/60">
                                    {id}
                                  </p>
                                  {data.count === 0 && data.ok && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-status-warning/20 text-status-warning rounded uppercase">
                                      System Empty
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-2xl font-black leading-none ${data.count > 0 ? "text-institutional-primary" : "text-institutional-muted"}`}
                                >
                                  {data.count ?? 0}
                                </p>
                                <p className="text-[8px] font-bold text-institutional-muted uppercase mt-1">
                                  {data.ok ? "Verified Records" : "Sync Failed"}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                        {Object.keys(healthData).length === 0 && (
                          <div className="text-center py-6 opacity-30 text-xs font-bold italic">
                            Awaiting registry data...
                          </div>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-gold/5 border border-gold/20 rounded-institutional">
                        <div className="flex items-center gap-3 mb-2">
                          <FiZap className="text-gold-deep" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-brick-deep">
                            Institutional Readiness
                          </p>
                        </div>
                        <p className="text-[10px] font-bold text-institutional-secondary leading-relaxed opacity-80">
                          System requires at least 1 record in each core
                          registry (Staff, Courses, Venues) to perform
                          intelligent orchestration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
