import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiCheck,
  FiDownload,
  FiInfo,
  FiLock,
  FiSettings,
  FiX,
  FiShield,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { generalSettingsService } from "../services/api/generalSettingsService";
import { constraintService } from "../services/api/constraintService";
import { courseService } from "../services/api/courseService";
import { algorithmService } from "../services/api/algorithmService";
import { GeneralSettings } from "../types/institutional";
import { periodExclusionService } from "../services/api/periodExclusionService";
import { CalendarGrid } from "../components/CalendarPeriodSelector/CalendarGrid";
import { useAuthStore } from "../services/state/authStore";
import { useInstitutionalStore } from "../services/state/institutionalStore";

/**
 * Institutional Academic Grid Orchestrator (Timetable)
 * Interactive calendar grid for period selection
 */
const TimetablePage: React.FC = () => {
  const { user } = useAuthStore();
  // Fallback to roleId 1 for Admin if roleCode is missing or mismatched
  const isAdmin = user?.roleCode === "AD" || user?.roleId === 1;

  // Global Context Store
  const {
    selectedGsId,
    selectedConstraintId,
    selectedExclusionId,
    topology,
    activeGS,
    setActiveGs,
    setConstraintId,
  } = useInstitutionalStore();

  const [courseCount, setCourseCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [generalHistory, setGeneralHistory] = useState<GeneralSettings[]>([]);
  const [constraintHistory, setConstraintHistory] = useState<any[]>([]);
  const [exclusionHistory, setExclusionHistory] = useState<any[]>([]);
  const [showConfigSelector, setShowConfigSelector] = useState(false);
  const [excludedPeriods, setExcludedPeriods] = useState<number[]>([]);

  // Checklist State - Representing the hard business gate
  const [checklist, setChecklist] = useState({
    session: false,
    semester: false,
    grid: false,
    constraints: false,
    exclusions: false, // Core requirement: Exclusions must be verified/initialized
  });

  // Reactive Checklist Engine
  React.useEffect(() => {
    setChecklist({
      session: !!activeGS?.session,
      semester: !!activeGS?.semester,
      grid: !!(selectedGsId && topology.periodsPerDay && topology.daysPerWeek),
      constraints: !!selectedConstraintId,
      exclusions: !!selectedExclusionId,
    });
  }, [activeGS, topology, selectedConstraintId, selectedExclusionId]);

  // Load initial settings and histories
  React.useEffect(() => {
    const loadReadiness = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Public Data (Settings, Latest Constraints, Active Exclusions)
        // These allows the Read-Only grid to render
        const [settingsData, , activeExclusions, coursesData] =
          await Promise.all([
            generalSettingsService.get(),
            constraintService.getLatest(),
            periodExclusionService.getActiveExclusions(),
            courseService.getAll(),
          ]);

        // 2. Fetch Admin-Only Data (Histories)
        let gHist: GeneralSettings[] = [];
        let cHist: any[] = [];

        if (isAdmin) {
          try {
            [gHist, cHist] = await Promise.all([
              generalSettingsService.getHistory(),
              constraintService.getHistory(),
            ]);
            // If we have a selectedGsId or an active server settings ID, fetch its exclusion history
            const gsIdForExclusions = selectedGsId || settingsData?.id;
            if (gsIdForExclusions) {
              const eHist =
                await periodExclusionService.getHistory(gsIdForExclusions);
              setExclusionHistory(eHist);
            }
          } catch (e) {
            console.warn("Admin history fetch warning", e);
          }
        }

        // Populate Diagnostics from API data (baseline reference)
        if (Array.isArray(coursesData)) {
          setCourseCount(coursesData.length);
        }
        if (activeExclusions) {
          setExcludedPeriods(activeExclusions.excludedPeriods || []);
        }

        if (activeGS && !(topology.periodsPerDay && topology.daysPerWeek)) {
          toast.warn(
            "Grid topology incomplete. Please define dimensions in Settings.",
          );
        }

        setGeneralHistory(gHist);
        setConstraintHistory(cHist);
      } catch (error) {
        console.error("Critical: Readiness check failed", error);
        toast.error("Failed to verify institutional readiness");
      } finally {
        setIsLoading(false);
      }
    };
    loadReadiness();
  }, []);

  // Reactive History Fetching
  React.useEffect(() => {
    if (selectedGsId && isAdmin) {
      const fetchContextHistory = async () => {
        try {
          const eHist = await periodExclusionService.getHistory(selectedGsId);
          setExclusionHistory(eHist);
        } catch (error) {
          console.warn("Failed to fetch contextual exclusion history", error);
        }
      };
      fetchContextHistory();
    }
  }, [selectedGsId, isAdmin]);

  const generateCsv = async () => {
    try {
      const message = await courseService.exportCsv();
      toast.info(`Institutional Export: ${message}`);
    } catch (err) {
      toast.error("CSV Export failure detected");
    }
  };

  const handleTimetableGeneration = async () => {
    if (!activeGS?.id) {
      toast.error(
        "Institutional configuration record (ID) missing. Cannot initialize engine.",
      );
      return;
    }

    try {
      // Pass the EXACT IDs from the Global Store to the algorithm
      const response = await algorithmService.trigger(
        selectedGsId || undefined,
        selectedConstraintId || undefined,
        selectedExclusionId || undefined,
      );

      if (response.status === "QUEUED") {
        toast.success(
          "Algorithm Triggered Successfully! (Background Process Started)",
        );
      }
    } catch (error: any) {
      toast.error(
        "Failed to trigger generation engine: " +
          (error.message || "Server Error"),
      );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-page/95 backdrop-blur-sm border-b border-brick/10 pb-4 flex justify-between items-end transition-all">
        <div>
          <h1 className="text-3xl font-extrabold text-institutional-primary tracking-tight mb-2">
            Schedule Orchestration
          </h1>
          <p className="text-institutional-secondary font-medium italic opacity-80">
            Timetable Engine • Scholastic Distribution Manifest
          </p>
        </div>
        <div className="flex gap-4">
          {!isAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-brick/10 border border-brick/20 rounded-institutional">
              <FiShield className="text-brick" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brick">
                Read-Only View
              </span>
            </div>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowConfigSelector(!showConfigSelector)}
              className="flex items-center gap-2 px-6 py-3 bg-institutional-primary text-white rounded-institutional text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-md"
            >
              <FiSettings className={showConfigSelector ? "rotate-90" : ""} />
              {showConfigSelector ? "Close Lock" : "Triple-Lock Selector"}
            </button>
          )}
          <button
            onClick={generateCsv}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-brick/10 rounded-institutional text-[10px] font-black uppercase tracking-widest text-brick hover:bg-brick hover:text-white transition-all shadow-sm"
          >
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {showConfigSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-page rounded-institutional shadow-2xl w-full max-w-2xl p-8 space-y-8 border border-brick/20"
          >
            <div className="flex justify-between items-center border-b border-brick/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brick/10 rounded-full flex items-center justify-center">
                  <FiLock className="text-brick" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brick">
                    Configuration Sentinel
                  </h3>
                  <p className="text-[10px] text-institutional-muted font-bold">
                    Select validated records for generation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigSelector(false)}
                className="p-2 hover:bg-brick/5 rounded-full transition-colors"
              >
                <FiX className="text-institutional-muted" size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: General Settings */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-institutional-primary">
                  <span className="w-5 h-5 bg-gold/20 text-gold-deep rounded-full flex items-center justify-center text-[8px]">
                    1
                  </span>
                  Academic Engine Context
                </label>
                <select
                  className="w-full bg-surface border border-brick/10 p-4 rounded-institutional font-bold text-sm focus:border-gold outline-none transition-all"
                  value={activeGS?.id || ""}
                  onChange={(e) => {
                    const selected = generalHistory.find(
                      (h) => h.id === parseInt(e.target.value),
                    );
                    if (selected) setActiveGs(selected);
                  }}
                >
                  <option value="">-- No Session Selected --</option>
                  {generalHistory.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.session} • {h.semester === 1 ? "Harmattan" : "Rain"}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-institutional-muted italic px-1">
                  Defines session dates and grid capacity.
                </p>
              </div>

              {/* Box 2: Constraints */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-institutional-primary">
                  <span className="w-5 h-5 bg-gold/20 text-gold-deep rounded-full flex items-center justify-center text-[8px]">
                    2
                  </span>
                  Constraint Logic Ledger
                </label>
                <select
                  className="w-full bg-surface border border-brick/10 p-4 rounded-institutional font-bold text-sm focus:border-gold outline-none transition-all"
                  value={selectedConstraintId || ""}
                  onChange={(e) =>
                    setConstraintId(
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                >
                  <option value="">-- No Constraints (Raw Run) --</option>
                  {constraintHistory.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({new Date(c.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-institutional-muted italic px-1">
                  Enforces course sequences and preferences.
                </p>
              </div>

              {/* Box 3: Temporal Exclusions */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-institutional-primary">
                  <span className="w-5 h-5 bg-gold/20 text-gold-deep rounded-full flex items-center justify-center text-[8px]">
                    3
                  </span>
                  Exclusion Matrix Snapshot
                </label>
                <select
                  className="w-full bg-surface border border-brick/10 p-4 rounded-institutional font-bold text-sm focus:border-gold outline-none transition-all"
                  value={selectedExclusionId || ""}
                  onChange={(e) =>
                    useInstitutionalStore
                      .getState()
                      .setExclusionId(
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                  }
                >
                  <option value="">-- No Exclusions (Open Grid) --</option>
                  {exclusionHistory.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.excludedPeriods.length} slots)
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-institutional-muted italic px-1">
                  Blocks specific periods from being assigned.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConfigSelector(false)}
              className="w-full py-4 bg-brick text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-institutional shadow-lg hover:brightness-110 transition-all"
            >
              Verify & Lock Configuration
            </button>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Column - Hidden for non-admins */}
        {isAdmin && (
          <div className="lg:col-span-4 space-y-5">
            <section className="bg-surface p-6 rounded-institutional border border-brick/5 shadow-sm space-y-3">
              <div className="flex items-center gap-3 border-b border-brick/5 pb-2">
                <FiInfo className="text-brick text-lg" />
                <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                  System Readiness Checklist
                </h2>
              </div>

              <div className="space-y-2">
                {[
                  {
                    label: "Academic Session Defined",
                    valid: checklist.session,
                  },
                  { label: "Semester Cycle Active", valid: checklist.semester },
                  { label: "Grid Topology Configured", valid: checklist.grid },
                  {
                    label: "Constraints Ledger Loaded",
                    valid: checklist.constraints,
                  },
                  {
                    label: "Exclusion Matrix Initialized",
                    valid: checklist.exclusions,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border flex items-center justify-between ${item.valid ? "bg-status-success/5 border-status-success/10" : "bg-status-warning/5 border-status-warning/10"}`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase ${item.valid ? "text-institutional-primary" : "text-institutional-muted"}`}
                    >
                      {item.label}
                    </span>
                    {item.valid ? (
                      <FiCheck className="text-status-success" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-status-warning/30" />
                    )}
                  </div>
                ))}

                {/* Capacity Diagnostic Section */}
                {activeGS?.periodsPerDay && activeGS?.daysPerWeek && (
                  <div className="mt-6 pt-4 border-t border-brick/5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiActivity className="text-brick text-xs" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-institutional-primary">
                        Capacity Diagnostics
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-page rounded border border-brick/5">
                        <p className="text-[8px] font-black text-institutional-muted uppercase mb-1">
                          Net Slots
                        </p>
                        <p className="text-lg font-black text-brick">
                          {topology.periodsPerDay *
                            topology.daysPerWeek *
                            (topology.examWeeks || 2) -
                            excludedPeriods.length}
                        </p>
                      </div>
                      <div className="p-3 bg-page rounded border border-brick/5">
                        <p className="text-[8px] font-black text-institutional-muted uppercase mb-1">
                          Course Load
                        </p>
                        <p className="text-lg font-black text-institutional-primary">
                          {courseCount}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-brick/5 rounded border border-brick/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-black text-brick uppercase">
                          Saturation Level
                        </span>
                        <span className="text-[8px] font-black text-brick">
                          {Math.round(
                            (courseCount /
                              (topology.periodsPerDay *
                                topology.daysPerWeek *
                                (topology.examWeeks || 2) -
                                excludedPeriods.length || 1)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1 w-full bg-brick/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brick transition-all duration-1000"
                          style={{
                            width: `${Math.min(
                              100,
                              (courseCount /
                                (topology.periodsPerDay *
                                  topology.daysPerWeek *
                                  (topology.examWeeks || 2) -
                                  excludedPeriods.length || 1)) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!Object.values(checklist).every(Boolean) && !isLoading && (
                  <div className="text-center p-4 bg-brick/5 rounded border border-brick/10">
                    <p className="text-xs text-brick font-bold mb-1">
                      Pre-Flight Use Only
                    </p>
                    <p className="text-[9px] text-institutional-muted">
                      Complete all configurations in the Settings module
                      designed for Admin access.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Submit Button Section */}
            <section className="bg-surface p-6 rounded-institutional border border-brick/5 shadow-sm mt-8">
              <button
                onClick={handleTimetableGeneration}
                disabled={!Object.values(checklist).every(Boolean) || isLoading}
                className="w-full px-6 py-4 bg-gradient-to-br from-gold to-gold-deep text-brick-deep rounded-institutional text-[11px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Initiate Timetable Generation
              </button>
              <div className="mt-4 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-institutional-muted italic">
                <span>Bells University Registry Engine v4.0</span>
                <span className="flex items-center gap-1">
                  <FiActivity className="animate-pulse" /> System Online
                </span>
              </div>
            </section>
          </div>
        )}

        {/* Interactive Calendar Grid - Expands to full width if admin controls are hidden */}
        <div
          className={`${isAdmin ? "lg:col-span-8" : "lg:col-span-12"} overflow-hidden`}
        >
          {!checklist.grid ? (
            <section className="bg-surface p-12 rounded-institutional border border-brick/5 shadow-sm min-h-[600px] flex flex-col items-center justify-center text-center opacity-40">
              <div className="text-7xl mb-6 grayscale">📅</div>
              <h3 className="text-lg font-black uppercase tracking-widest mb-2">
                Grid Topology Undefined
              </h3>
              <p className="max-w-xs text-xs font-bold italic">
                Execute assessment parameters in the settings module to
                visualize the temporal manifest.
              </p>
            </section>
          ) : (
            <div className="space-y-6">
              <CalendarGrid
                settingsId={selectedGsId || undefined}
                onSave={() => {
                  toast.success("Exclusions updated. Ready for generation.");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;
