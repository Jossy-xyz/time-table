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
import { algorithmService } from "../services/api/algorithmService";
import { GeneralSettings } from "../types/institutional";
import { periodExclusionService } from "../services/api/periodExclusionService";
import { CalendarGrid } from "../components/CalendarPeriodSelector/CalendarGrid";
import { useAuthStore } from "../services/state/authStore";

/**
 * Institutional Academic Grid Orchestrator (Timetable)
 * Interactive calendar grid for period selection
 */
const TimetablePage: React.FC = () => {
  const { user } = useAuthStore();
  // Fallback to roleId 1 for Admin if roleCode is missing or mismatched
  const isAdmin = user?.roleCode === "AD" || user?.roleId === 1;

  // Core State
  const [settings, setSettings] = useState<Partial<GeneralSettings>>({});
  const [loadedConstraintId, setLoadedConstraintId] = useState<number | null>(
    null,
  );
  const [activeExclusionId, setActiveExclusionId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [generalHistory, setGeneralHistory] = useState<GeneralSettings[]>([]);
  const [constraintHistory, setConstraintHistory] = useState<any[]>([]);
  const [showConfigSelector, setShowConfigSelector] = useState(false);

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
      session: !!settings.session,
      semester: !!settings.semester,
      grid: !!(settings.periodsPerDay && settings.daysPerWeek),
      constraints: !!loadedConstraintId,
      exclusions: !!activeExclusionId,
    });
  }, [settings, loadedConstraintId, activeExclusionId]);

  // Load initial settings and histories
  React.useEffect(() => {
    const loadReadiness = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Public Data (Settings, Latest Constraints, Active Exclusions)
        // These allows the Read-Only grid to render
        const [settingsData, constraintsData, activeExclusions] =
          await Promise.all([
            generalSettingsService.get(),
            constraintService.getLatest(),
            periodExclusionService.getActiveExclusions(),
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
          } catch (e) {
            console.warn("Admin history fetch warning", e);
          }
        }

        if (settingsData) {
          setSettings(settingsData);
          if (constraintsData) setLoadedConstraintId(constraintsData.id);
          if (activeExclusions) setActiveExclusionId(activeExclusions.id);

          if (!(settingsData.periodsPerDay && settingsData.daysPerWeek)) {
            toast.warn(
              "Grid topology incomplete. Please define dimensions in Settings.",
            );
          }
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

  const generateCsv = async () => {
    try {
      const res = await fetch("http://localhost:8080/course/export");
      const message = await res.text();
      toast.info(`Institutional Export: ${message}`);
    } catch (err) {
      toast.error("CSV Export failure detected");
    }
  };

  const handleTimetableGeneration = async () => {
    if (!settings.id) {
      toast.error(
        "Institutional configuration record (ID) missing. Cannot initialize engine.",
      );
      return;
    }

    try {
      toast.info(`Initializing Engine for Session ${settings.session}...`);

      // Pass the EXACT IDs loaded in the frontend to the algorithm
      const response = await algorithmService.trigger(
        settings.id,
        loadedConstraintId || undefined,
        activeExclusionId || undefined,
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  value={settings.id || ""}
                  onChange={(e) => {
                    const selected = generalHistory.find(
                      (h) => h.id === parseInt(e.target.value),
                    );
                    if (selected) setSettings(selected);
                  }}
                >
                  {generalHistory.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.session} • {h.semester === "1" ? "Harmattan" : "Rain"}{" "}
                      (ID: {h.id})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-institutional-muted italic px-1">
                  Defines session dates, levels, and grid capacity.
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
                  value={loadedConstraintId || ""}
                  onChange={(e) =>
                    setLoadedConstraintId(
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
                  Enforces course sequences and venue preferences.
                </p>
              </div>
            </div>

            <div className="bg-brick/5 p-4 rounded-institutional border border-brick/10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <FiActivity className="text-gold" size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-institutional-primary mb-1">
                    Active Exclusion Matrix (Auto-Linked)
                  </p>
                  <p className="text-[9px] text-institutional-muted">
                    The engine will automatically pull the <b>Active</b>{" "}
                    temporal exclusion mask associated with the selected
                    settings ID.
                  </p>
                </div>
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
                settingsId={settings.id}
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
