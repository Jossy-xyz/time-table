import React, { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../services/state/authStore";
import { GeneralSettings, PeriodMappingResponse } from "../types/institutional";
import { generalSettingsService } from "../services/api/generalSettingsService";
import { constraintService } from "../services/api/constraintService";
import { periodExclusionService } from "../services/api/periodExclusionService";
import {
  FiX,
  FiDownload,
  FiDatabase,
  FiSettings,
  FiCheckCircle,
  FiChevronRight,
  FiActivity,
  FiWifi,
  FiRefreshCw,
  FiZap,
  FiRotateCcw,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstitutionalConstraintsSection from "../components/molecules/InstitutionalConstraintsSection";
import { useInstitutionalStore } from "../services/state/institutionalStore";
import { courseService } from "../services/api/courseService";
import { venueService } from "../services/api/venueService";
import { staffService } from "../services/api/staffService";
import { studentService } from "../services/api/studentService";
import { examSettingsService } from "../services/api/examSettingsService";
import {
  outputSettingsService,
  OutputSettings,
} from "../services/api/outputSettingsService";

interface OptimizationParameter {
  checked: boolean;
  value: string;
}

interface OptimizationAlgo {
  checked: boolean;
  parameters: any;
}

const TABS = [
  { id: "general", label: "Academic Engine Context", icon: "🎓" },
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

/**
 * Institutional Configuration Page
 * Refactored from the SettingsPanel modal to a first-class page.
 * Enforces institutional design and professional calibration surfaces.
 */
const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.roleCode === "AD" || user?.roleId === 1;

  // Global Context Store & Persistent Orchestration
  const { topology, activeGS, setActiveGs, setConstraintId } =
    useInstitutionalStore();

  // Filter tabs based on role - only Admin has access to all except health
  const filteredTabs = TABS.filter((tab) => isAdmin || tab.id === "health");

  const [activeTab, setActiveTab] = useState<string>(
    isAdmin ? "general" : "health",
  );

  // General Settings State - Hydrate from store if available, else use defaults
  const [generalSettings, setGeneralSettings] = useState<
    Partial<GeneralSettings>
  >(
    activeGS
      ? {
          ...activeGS,
          description: activeGS.description || "Institutional_Draft_v1",
        }
      : {
          description: "Configuration_1",
          session: "",
          semester: 1,
          daysPerWeek: 5,
          periodsPerDay: 5,
          startDate: "",
          endDate: "",
          examCategory: 0,
          campusType: 0,
          examLevel: "100,200,300,400,500",
          examWeeks: 2,
        },
  );

  const [courses, setCourses] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [initialConstraints, setInitialConstraints] = useState<
    Record<string, string>
  >({});
  const [periodMapping, setPeriodMapping] =
    useState<PeriodMappingResponse | null>(null);
  const [excludedPeriods, setExcludedPeriods] = useState<number[]>([]);

  // Automatic Week Computation: "Floored up" duration calculation
  useEffect(() => {
    if (generalSettings.startDate && generalSettings.endDate) {
      const start = new Date(generalSettings.startDate);
      const end = new Date(generalSettings.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const weeks = Math.ceil(diffDays / 7);

      if (generalSettings.examWeeks !== weeks) {
        setGeneralSettings((prev) => ({ ...prev, examWeeks: weeks }));
      }
    }
  }, [generalSettings.startDate, generalSettings.endDate]);

  // Functional Dirty Check: Description is locked until a parameter changes
  const isFunctionalDirty =
    !activeGS ||
    generalSettings.session !== activeGS.session ||
    generalSettings.semester !== activeGS.semester ||
    generalSettings.daysPerWeek !== activeGS.daysPerWeek ||
    generalSettings.periodsPerDay !== activeGS.periodsPerDay ||
    generalSettings.startDate !== activeGS.startDate ||
    generalSettings.endDate !== activeGS.endDate ||
    generalSettings.examCategory !== activeGS.examCategory ||
    generalSettings.campusType !== activeGS.campusType ||
    generalSettings.examLevel !== activeGS.examLevel;

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

  // Functional Dirty Checks for other sections
  const isExamDirty =
    examPolicy !== "" || maxExamL !== "" || minExamL !== "" || examLevel !== "";

  const [outputSettings, setOutputSettings] = useState<Partial<OutputSettings>>(
    {
      invigilator_ratio: 30,
      invigilator_special_ratio: 15,
      venue_alg: 1,
      venue_alg_order: 1,
      mix_exams: 1,
      more_space: 0,
      le_fullyinV: 1,
      use_half_venue: 0,
      select_staff_random: 1,
      use_staff_ids: 0,
      update_staff_duty: 1,
      skip_week: 0,
      gen_sitting_arr: 0,
      save_file: 1,
      save_to_db: 1,
    },
  );
  const [initialOutputSnapshot, setInitialOutputSnapshot] =
    useState<Partial<OutputSettings> | null>(null);

  const isOutputDirty =
    JSON.stringify(outputSettings) !== JSON.stringify(initialOutputSnapshot);

  const isOptimizationDirty = Object.values(optimize).some((v) => v.checked);

  // Health & Heartbeat State
  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [checkingHealth, setCheckingHealth] = useState(false);

  // General History State
  const [generalHistory, setGeneralHistory] = useState<GeneralSettings[]>([]);
  const [showGeneralHistory, setShowGeneralHistory] = useState(false);
  const [isLoadingGeneralHistory, setIsLoadingGeneralHistory] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const loadInitialData = async () => {
        try {
          const [
            gs,
            latestConstraints,
            exclusionsData,
            coursesData,
            venuesData,
            staffData,
            mappingData,
            outputData,
          ] = await Promise.all([
            generalSettingsService.get(),
            constraintService.getLatest(),
            periodExclusionService.getActiveExclusions(),
            courseService.getAll(),
            venueService.getAll(),
            staffService.getAll(),
            periodExclusionService.getMapping(),
            outputSettingsService.get(),
          ]);

          if (gs) {
            setGeneralSettings(gs);
            // If we have an active session in the store, ensure the local UI is in sync
            // but we stop short of 'lock-in' promotion to satisfy cold-start
            if (activeGS?.id === gs.id) {
              // Already in sync
            }
          }
          if (Array.isArray(coursesData)) setCourses(coursesData);
          if (Array.isArray(venuesData)) setVenues(venuesData);
          if (Array.isArray(staffData)) setStaff(staffData);
          if (outputData) {
            setOutputSettings(outputData);
            setInitialOutputSnapshot(outputData);
          }
          if (mappingData) {
            setPeriodMapping(mappingData);
            const systemLocked = mappingData.periods
              .filter((p: any) => p.isSystemLocked)
              .map((p: any) => p.periodIndex);

            const baseExclusions = exclusionsData?.excludedPeriods || [];
            const merged = Array.from(
              new Set([...baseExclusions, ...systemLocked]),
            );
            setExcludedPeriods(merged);
          } else if (exclusionsData) {
            setExcludedPeriods(exclusionsData.excludedPeriods || []);
          }

          if (latestConstraints) {
            // setConstraintId(latestConstraints.id || null); // REMOVED: Selection must be manual/reviewed
            const formatted: Record<string, string> = {
              periodIncE: latestConstraints.periodIncE || "",
              periodExcE: latestConstraints.periodExcE || "",
              venueIncE: latestConstraints.venueIncE || "",
              venueExcE: latestConstraints.venueExcE || "",
              periodIncV: latestConstraints.periodIncV || "",
              periodExcV: latestConstraints.periodExcV || "",
              examWAftE: latestConstraints.examWAftE || "",
              examExcE: latestConstraints.examExcE || "",
              examWCoinE: latestConstraints.examWCoinE || "",
              frontLE: latestConstraints.frontLE || "",
              staffOmit: latestConstraints.staffOmit || "",
              staffPeriodExcl: latestConstraints.staffPeriodExcl || "",
            };
            setInitialConstraints(formatted);
          }
        } catch (error) {
          console.error("Failed to load initial settings data", error);
        }
      };
      loadInitialData();
    }
  }, [isAdmin, user?.username]);

  const handleGeneralSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // RICHO TAKE NOTE
    if (
      generalSettings.startDate &&
      generalSettings.endDate &&
      new Date(generalSettings.endDate) < new Date(generalSettings.startDate)
    ) {
      toast.error("End Date cannot be earlier than Start Date");
      return;
    }

    try {
      await generalSettingsService.update(generalSettings as GeneralSettings);
      setActiveGs(generalSettings); // Sync to global store on manual save

      // Refresh context-dependent data (Mapping & Exclusions)
      const [newMapping, newExclusions] = await Promise.all([
        periodExclusionService.getMapping(generalSettings.id),
        periodExclusionService.getActiveExclusions(generalSettings.id),
      ]);
      setPeriodMapping(newMapping);
      if (newMapping) {
        const systemLocked = newMapping.periods
          .filter((p: any) => p.isSystemLocked)
          .map((p: any) => p.periodIndex);
        const baseExclusions = newExclusions?.excludedPeriods || [];
        setExcludedPeriods(
          Array.from(new Set([...baseExclusions, ...systemLocked])),
        );
      }

      toast.success(
        "Academic engine orchestration parameters updated and locked.",
      );
      // Refresh history after update
      if (isAdmin) loadGeneralHistory();
    } catch (error) {
      toast.error("Failed to synchronize engine parameters");
    }
  };

  const loadGeneralHistory = async () => {
    setIsLoadingGeneralHistory(true);
    try {
      const history = await generalSettingsService.getHistory();
      setGeneralHistory(history);
    } catch (error) {
      console.error("Failed to load general history", error);
    } finally {
      setIsLoadingGeneralHistory(false);
    }
  };

  const restoreGeneralSnapshot = (gs: GeneralSettings) => {
    setGeneralSettings(gs);
    setActiveGs(gs); // Sync to global store immediately on restore
    setShowGeneralHistory(false);
    toast.info(`Restored version from ${gs.session} session`);
  };

  const fetchConstraintHistory = async () => {
    return await constraintService.getHistory();
  };

  const fetchHealth = async () => {
    setCheckingHealth(true);
    const endpoints = [
      { id: "staff", fn: staffService.getAll, name: "Personnel Ledger" },
      { id: "student", fn: studentService.getAll, name: "Student Registry" },
      { id: "course", fn: courseService.getAll, name: "Curriculum Assets" },
      {
        id: "venue",
        fn: venueService.getAll,
        name: "Infrastructure Portfolio",
      },
    ];

    const results: Record<string, any> = {};

    for (const ep of endpoints) {
      // Manual timeout handling with services can be tricky, relying on service timeout config (if any) or wrapping
      try {
        const data = await ep.fn();
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

  // New save function for refactored constraints section
  const saveConstraintsToDB = async (constraints: Record<string, string>) => {
    try {
      // Use the service to handle the save with correct endpoint/actor mapping
      const result = await constraintService.saveAll(constraints);
      // Backend returns the new record on save, but if not we trigger a reload
      const latest = await constraintService.getLatest();
      if (latest) setConstraintId(latest.id || null);

      toast.success("Institutional constraint snapshot saved successfully");
      return Promise.resolve();
    } catch (error) {
      toast.error("Failed to persist constraint snapshot");
      return Promise.reject(error);
    }
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

  const saveExamSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await examSettingsService.create({
        schedule_policy: parseInt(examPolicy),
        max_examl: parseInt(maxExamL),
        min_examl: parseInt(minExamL),
        exam_level_high_limit: examLevel,
      });
      toast.success("Academic examination boundaries established");
    } catch (error) {
      toast.error("Critical failure during exam setting save");
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
          {filteredTabs.map((tab) => (
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
              {activeTab === "general" && isAdmin && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiDatabase className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      General Orchestration
                    </h2>
                    <div className="flex-1" />
                    <button
                      onClick={() => {
                        setShowGeneralHistory(true);
                        loadGeneralHistory();
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-institutional-muted border-b border-dashed border-institutional-muted hover:text-brick hover:border-brick transition-all flex items-center gap-1"
                    >
                      <FiRotateCcw size={10} />
                      View Version History
                    </button>
                  </div>
                  <form
                    onSubmit={handleGeneralSettingsSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="input-group col-span-1 md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                          Configuration Title / Description
                        </label>
                      </div>
                      <input
                        type="text"
                        disabled={!isFunctionalDirty}
                        className={`w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm outline-none transition-all ${
                          !isFunctionalDirty
                            ? "opacity-50 cursor-not-allowed bg-brick/5"
                            : "focus:border-brick"
                        }`}
                        value={generalSettings.description || ""}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="e.g., Harmattan Regular Session Alpha Run"
                      />
                    </div>
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Academic Session
                      </label>
                      <input
                        type="text"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={generalSettings.session}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            session: e.target.value,
                          }))
                        }
                        placeholder="e.g., 2024/2025"
                      />
                    </div>
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Semester Cycle
                      </label>
                      <select
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={generalSettings.semester}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            semester: parseInt(e.target.value),
                          }))
                        }
                      >
                        <option value={1}>Harmattan (1st Semester)</option>
                        <option value={2}>Rain (2nd Semester)</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Days Per Week
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={generalSettings.daysPerWeek}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            daysPerWeek: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Periods Per Day
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={generalSettings.periodsPerDay}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            periodsPerDay: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={generalSettings.startDate}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={generalSettings.endDate}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Examination Category
                      </label>
                      <select
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={generalSettings.examCategory}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            examCategory: parseInt(e.target.value),
                          }))
                        }
                      >
                        <option value={0}>Regular</option>
                        <option value={1}>TopUp</option>
                        <option value={2}>Part-Time</option>
                        <option value={3}>Online</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Campus Type
                      </label>
                      <select
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={generalSettings.campusType}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            campusType: parseInt(e.target.value),
                          }))
                        }
                      >
                        <option value={0}>Single Campus</option>
                        <option value={1}>Multi Campus</option>
                      </select>
                    </div>

                    <div className="input-group col-span-1 md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-4">
                        Examination Level (Filtered)
                      </label>
                      <div className="flex flex-wrap gap-4 bg-brick/5 p-4 rounded-institutional border border-brick/10">
                        {["100", "200", "300", "400", "500"].map((level) => (
                          <label
                            key={level}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-brick/20 bg-white checked:bg-brick checked:border-brick transition-all shadow-sm"
                                checked={
                                  generalSettings.examLevel === "All" ||
                                  (generalSettings.examLevel || "")
                                    .split(",")
                                    .includes(level)
                                }
                                onChange={(e) => {
                                  let currentLevels =
                                    generalSettings.examLevel === "All"
                                      ? ["100", "200", "300", "400", "500"]
                                      : generalSettings.examLevel
                                          ?.split(",")
                                          .filter(
                                            (l) => Boolean(l) && l !== "All",
                                          ) || [];

                                  if (e.target.checked) {
                                    if (!currentLevels.includes(level))
                                      currentLevels.push(level);
                                  } else {
                                    currentLevels = currentLevels.filter(
                                      (l) => l !== level,
                                    );
                                  }

                                  const newVal =
                                    currentLevels.length === 5
                                      ? "100,200,300,400,500"
                                      : currentLevels.join(",");
                                  setGeneralSettings((prev) => ({
                                    ...prev,
                                    examLevel: newVal,
                                  }));
                                }}
                              />
                              <FiCheckCircle className="absolute inset-0 m-auto h-3 w-3 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
                            </div>
                            <span className="text-xs font-bold text-institutional-primary group-hover:text-brick transition-all">
                              {level}L
                            </span>
                          </label>
                        ))}
                        <div className="w-[1px] h-4 bg-brick/20 mx-2" />
                        <button
                          type="button"
                          onClick={() =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              examLevel:
                                prev.examLevel === "100,200,300,400,500" ||
                                prev.examLevel === "All"
                                  ? ""
                                  : "100,200,300,400,500",
                            }))
                          }
                          className="text-[10px] font-black uppercase tracking-widest text-brick hover:underline"
                        >
                          {generalSettings.examLevel ===
                            "100,200,300,400,500" ||
                          generalSettings.examLevel === "All"
                            ? "Clear Selection"
                            : "Select All"}
                        </button>
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Computed Duration (Weeks)
                      </label>
                      <div className="w-full bg-brick/5 border border-brick/10 px-4 py-3 rounded font-black text-sm text-brick flex items-center gap-2">
                        <FiActivity className="animate-pulse" />
                        {generalSettings.examWeeks || 0} Week(s) Active
                      </div>
                      <p className="text-[9px] text-institutional-muted mt-1 italic">
                        Automatically derived from date range (Locked).
                      </p>
                    </div>
                    <div className="flex items-center gap-3 col-span-2 mt-4">
                      <button
                        type="submit"
                        className="px-10 py-3 bg-brick text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-brick/20 hover:scale-105 transition-all"
                      >
                        Commit General Parameters
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "constraint" && isAdmin && (
                <InstitutionalConstraintsSection
                  onSaveAll={saveConstraintsToDB}
                  onLoadHistory={fetchConstraintHistory}
                  availableCourses={courses.map((c) => ({
                    code: c.code,
                    title: c.title,
                  }))}
                  availableVenues={venues.map((v) => ({
                    code: v.venueCode,
                    name: v.name,
                  }))}
                  availableStaff={(staff || []).map((s) => ({
                    code: s.staffId || s.id?.toString() || "STAFF",
                    title:
                      `${s.title || ""} ${s.surname || ""} ${s.firstname || ""}`.trim(),
                  }))}
                  maxPeriods={topology.periodsPerDay}
                  periodMapping={periodMapping}
                  excludedPeriods={excludedPeriods}
                  initialConstraints={initialConstraints}
                />
              )}

              {activeTab === "examination" && isAdmin && (
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
                      <button
                        type="submit"
                        disabled={!isExamDirty}
                        className={`px-10 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg transition-all ${
                          !isExamDirty
                            ? "bg-brick/20 cursor-not-allowed"
                            : "bg-brick shadow-brick/20 hover:scale-105"
                        }`}
                      >
                        Authorize Parameters
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "output" && isAdmin && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiDownload className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Output Projections
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Numeric Inputs */}
                    <div className="space-y-4">
                      <div className="input-group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                          Student/Invigilator Ratio
                        </label>
                        <input
                          type="number"
                          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                          value={outputSettings.invigilator_ratio}
                          onChange={(e) =>
                            setOutputSettings((prev) => ({
                              ...prev,
                              invigilator_ratio: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                          Invigilator in Special Venue
                        </label>
                        <input
                          type="number"
                          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                          value={outputSettings.invigilator_special_ratio}
                          onChange={(e) =>
                            setOutputSettings((prev) => ({
                              ...prev,
                              invigilator_special_ratio:
                                parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                          Venue Selection Policy
                        </label>
                        <select
                          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                          value={outputSettings.venue_alg}
                          onChange={(e) =>
                            setOutputSettings((prev) => ({
                              ...prev,
                              venue_alg: parseInt(e.target.value),
                            }))
                          }
                        >
                          <option value={1}>Default Policy</option>
                          <option value={2}>Sequential Fill</option>
                          <option value={3}>Balanced Distribution</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                          Venue Selection Order
                        </label>
                        <select
                          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                          value={outputSettings.venue_alg_order}
                          onChange={(e) =>
                            setOutputSettings((prev) => ({
                              ...prev,
                              venue_alg_order: parseInt(e.target.value),
                            }))
                          }
                        >
                          <option value={1}>Ascending Capacity</option>
                          <option value={2}>Descending Capacity</option>
                          <option value={3}>Alphabetical</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                      {[
                        {
                          key: "mix_exams",
                          label: "Mix Exams in Venue",
                        },
                        {
                          key: "more_space",
                          label: "Use More Space for Large Exams",
                        },
                        {
                          key: "le_fullyinV",
                          label: "Large Exams Fully in Venue",
                        },
                        {
                          key: "use_half_venue",
                          label: "Use Half Venue Space",
                        },
                        {
                          key: "select_staff_random",
                          label: "Select Staff Randomly",
                        },
                        {
                          key: "use_staff_ids",
                          label: "Use Staff IDs",
                        },
                        {
                          key: "update_staff_duty",
                          label: "Update Staff Duty Count",
                        },
                        {
                          key: "skip_week",
                          label: "Skip Week in Timetable",
                        },
                        {
                          key: "gen_sitting_arr",
                          label: "Generate Sitting Arrangements",
                        },
                        {
                          key: "save_file",
                          label: "Save Timetable to File",
                        },
                        {
                          key: "save_to_db",
                          label: "Save Timetable to Database",
                        },
                      ].map((opt) => (
                        <label
                          key={opt.key}
                          className="flex items-center justify-between p-3 bg-page/50 rounded border border-brick/5 cursor-pointer hover:border-brick/10"
                        >
                          <span className="text-xs font-bold text-institutional-primary">
                            {opt.label}
                          </span>
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-brick"
                            checked={
                              (outputSettings as any)[opt.key] === 1 ||
                              (outputSettings as any)[opt.key] === true
                            }
                            onChange={(e) =>
                              setOutputSettings((prev) => ({
                                ...prev,
                                [opt.key]: e.target.checked ? 1 : 0,
                              }))
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-brick/5">
                    <button
                      onClick={async () => {
                        try {
                          await outputSettingsService.save(
                            outputSettings as OutputSettings,
                          );
                          setInitialOutputSnapshot(outputSettings);
                          toast.success("Output projections authorized");
                        } catch (e) {
                          toast.error("Failed to commit output policy");
                        }
                      }}
                      disabled={!isOutputDirty}
                      className={`px-10 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all ${
                        !isOutputDirty
                          ? "bg-brick/20 cursor-not-allowed"
                          : "bg-brick hover:scale-105"
                      }`}
                    >
                      Commit Output Policy
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "optimization" && isAdmin && (
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
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-brick/5">
                    <button
                      onClick={() => {
                        toast.success("Mathematical orchestration committed.");
                      }}
                      disabled={!isOptimizationDirty}
                      className={`px-10 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all ${
                        !isOptimizationDirty
                          ? "bg-brick/20 cursor-not-allowed"
                          : "bg-brick hover:scale-105"
                      }`}
                    >
                      Commit Optimization Protocol
                    </button>
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

      {/* General Settings History Modal */}
      <AnimatePresence>
        {showGeneralHistory && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-page rounded-institutional shadow-2xl w-full max-w-lg p-6 space-y-4 border border-brick/20 overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-brick/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brick/5 rounded-full flex items-center justify-center">
                    <FiRotateCcw className="text-brick" size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-brick">
                      Orchestration Log
                    </h3>
                    <p className="text-[9px] text-institutional-muted font-bold tracking-tight">
                      Historical Parameter Snapshots
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGeneralHistory(false)}
                  className="p-2 hover:bg-brick/5 rounded-full transition-colors"
                >
                  <FiX className="text-institutional-muted" size={18} />
                </button>
              </div>

              {isLoadingGeneralHistory ? (
                <div className="py-20 text-center">
                  <FiRefreshCw
                    className="animate-spin text-brick mx-auto mb-4"
                    size={24}
                  />
                  <p className="text-xs font-bold text-brick italic">
                    Consulting historical archives...
                  </p>
                </div>
              ) : generalHistory.length === 0 ? (
                <div className="py-20 text-center opacity-40">
                  <FiDatabase className="mx-auto mb-4" size={32} />
                  <p className="text-sm font-bold">
                    No historical snapshots found.
                  </p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 institutional-scroll">
                  {generalHistory.map((gs) => (
                    <div
                      key={gs.id}
                      className="flex justify-between items-center p-4 bg-surface border border-brick/5 rounded-institutional group hover:border-brick/20 transition-all shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-brick uppercase tracking-tight">
                            {gs.description || "Experimental_Context"}
                          </p>
                          <span className="text-[8px] px-1.5 py-0.5 bg-brick/10 text-brick rounded font-black">
                            ID: {gs.id}
                          </span>
                        </div>
                        <p className="text-[9px] text-institutional-primary font-bold uppercase leading-tight">
                          Session {gs.session} •{" "}
                          {gs.semester === 1 ? "Harmattan" : "Rain"}
                        </p>
                        <p className="text-[8px] text-institutional-muted font-bold uppercase">
                          {gs.daysPerWeek} Days • {gs.periodsPerDay} Periods
                        </p>
                      </div>
                      <button
                        onClick={() => restoreGeneralSnapshot(gs)}
                        className="px-4 py-2 bg-institutional-primary text-white text-[9px] font-black uppercase tracking-widest rounded shadow-institutional-sm hover:brightness-110 transition-all"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-brick/10 text-center">
                <p className="text-[8px] text-institutional-muted font-black uppercase tracking-widest italic opacity-60">
                  Bells University Registry Management System
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
