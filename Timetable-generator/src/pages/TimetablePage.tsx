import React, { useState } from "react";
import { FiActivity, FiCheck, FiDownload, FiInfo, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { generalSettingsService } from "../services/api/generalSettingsService";
import { constraintService } from "../services/api/constraintService";
import { algorithmService } from "../services/api/algorithmService";
import { GeneralSettings } from "../types/institutional";

interface PeriodSlot {
  id: string;
  day: string;
  period: number;
  selected: boolean;
}

/**
 * Institutional Academic Grid Orchestrator (Timetable)
 * Interactive calendar grid for period selection
 */
const TimetablePage: React.FC = () => {
  // Core State
  // Config loaded from backend (readonly here)
  const [settings, setSettings] = useState<Partial<GeneralSettings>>({});

  // Interactive Grid State
  const [gridInitialized, setGridInitialized] = useState(false);
  const [periodSlots, setPeriodSlots] = useState<PeriodSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Checklist State
  const [checklist, setChecklist] = useState({
    session: false,
    semester: false,
    grid: false,
    constraints: false,
  });

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Load initial settings and initialize grid
  React.useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const [settingsData, constraintsData] = await Promise.all([
          generalSettingsService.get(),
          constraintService.getLatest(),
        ]);

        if (settingsData) {
          setSettings(settingsData);

          const hasSession = !!settingsData.session;
          const hasSemester = !!settingsData.semester;
          const hasGrid = !!(
            settingsData.periodsPerDay && settingsData.daysPerWeek
          );
          const hasConstraints = !!constraintsData;

          setChecklist({
            session: hasSession,
            semester: hasSemester,
            grid: hasGrid,
            constraints: hasConstraints,
          });

          // Verify critical config exists
          if (hasGrid) {
            initializePeriodSlots(settingsData.periodsPerDay!);
            setGridInitialized(true);
          } else {
            toast.warn(
              "Grid configuration incompele. Please visit Settings page.",
            );
          }
        }
      } catch (error) {
        console.error("Failed to load existing settings", error);
        toast.error("Failed to load institutional configuration");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const initializePeriodSlots = (periods: number) => {
    const slots: PeriodSlot[] = [];
    dayNames.forEach((day) => {
      for (let period = 1; period <= periods; period++) {
        slots.push({
          id: `${day}-P${period}`,
          day,
          period,
          selected: true,
        });
      }
    });
    setPeriodSlots(slots);
  };

  const togglePeriodSelection = (slotId: string) => {
    setPeriodSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, selected: !slot.selected } : slot,
      ),
    );
  };

  const selectAllPeriods = () => {
    setPeriodSlots((prev) => prev.map((slot) => ({ ...slot, selected: true })));
    toast.success("All periods selected");
  };

  const deselectAllPeriods = () => {
    setPeriodSlots((prev) =>
      prev.map((slot) => ({ ...slot, selected: false })),
    );
    toast.info("All periods deselected");
  };

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
    const selectedSlots = periodSlots.filter((slot) => slot.selected);
    if (selectedSlots.length === 0) {
      toast.warn("Select at least one period to proceed");
      return;
    }

    // Here we would typically update the "selected periods" in the backend
    // Since our backend doesn't explicit store per-period selection in general_settings yet,
    // we might need to assume ALL periods defined in config are valid,
    // OR we update general_settings if we add a field for it.
    // For now, let's treat this as the "Trigger Algorithm" button.

    try {
      toast.info("Initializing Timetable Generation Engine...");

      const response = await algorithmService.trigger();

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

  const selectedCount = periodSlots.filter((s) => s.selected).length;
  const totalSlots = periodSlots.length;

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
          <button
            onClick={generateCsv}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-brick/10 rounded-institutional text-[10px] font-black uppercase tracking-widest text-brick hover:bg-brick hover:text-white transition-all shadow-sm"
          >
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Column */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-surface p-6 rounded-institutional border border-brick/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-brick/5 pb-4">
              <FiInfo className="text-brick text-lg" />
              <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                System Readiness Checklist
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { label: "Academic Session Defined", valid: checklist.session },
                { label: "Semester Cycle Active", valid: checklist.semester },
                { label: "Grid Topology Configured", valid: checklist.grid },
                {
                  label: "Constraints Ledger Loaded",
                  valid: checklist.constraints,
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
                    Complete all configurations in the Settings module designed
                    for Admin access.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Interactive Calendar Grid */}
        <div className="lg:col-span-8">
          <section className="bg-surface p-8 rounded-institutional border border-brick/5 shadow-sm min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b border-brick/5 pb-4">
              <div className="flex items-center gap-3">
                <FiActivity className="text-brick text-xl" />
                <h2 className="text-sm font-black uppercase tracking-widest text-brick">
                  Calendar Projection Surface
                </h2>
              </div>
              {gridInitialized && (
                <span className="text-[10px] font-black bg-status-success/10 text-status-success px-3 py-1 rounded-full uppercase tracking-widest italic animate-pulse">
                  Engine Synchronized
                </span>
              )}
            </div>

            {!gridInitialized ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <div className="text-7xl mb-6 grayscale">📅</div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-2">
                  Grid Dimension Unknown
                </h3>
                <p className="max-w-xs text-xs font-bold italic">
                  Execute assessment parameters to visualize the temporal
                  manifest.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Grid Controls */}
                <div className="flex items-center justify-between p-4 bg-page/50 rounded-institutional border border-brick/10">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                      Selected: {selectedCount} / {totalSlots}
                    </span>
                    <div className="h-4 w-px bg-brick/20" />
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllPeriods}
                        className="px-3 py-1.5 bg-status-success/10 text-status-success rounded text-[9px] font-black uppercase tracking-widest hover:bg-status-success/20 transition-all flex items-center gap-1"
                      >
                        <FiCheck size={12} /> Select All
                      </button>
                      <button
                        onClick={deselectAllPeriods}
                        className="px-3 py-1.5 bg-status-error/10 text-status-error rounded text-[9px] font-black uppercase tracking-widest hover:bg-status-error/20 transition-all flex items-center gap-1"
                      >
                        <FiX size={12} /> Clear All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Grid */}
                <div className="space-y-6">
                  {/* Week Header */}
                  <div className="grid grid-cols-7 gap-3">
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="text-center py-3 bg-brick/5 rounded-institutional border border-brick/10"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-brick">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Period Rows */}
                  {Array.from(
                    { length: settings.periodsPerDay || 0 },
                    (_, periodIdx) => (
                      <div key={periodIdx} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-institutional-muted">
                            Period {periodIdx + 1}
                          </span>
                          <div className="flex-1 h-px bg-brick/10" />
                        </div>
                        <div className="grid grid-cols-7 gap-3">
                          {dayNames.map((day) => {
                            const slot = periodSlots.find(
                              (s) =>
                                s.day === day && s.period === periodIdx + 1,
                            );
                            if (!slot) return null;

                            return (
                              <button
                                key={slot.id}
                                onClick={() => togglePeriodSelection(slot.id)}
                                className={`
                                relative p-4 rounded-institutional border-2 transition-all duration-300 group
                                ${
                                  slot.selected
                                    ? "bg-brick text-white border-brick shadow-lg shadow-brick/20 hover:scale-105"
                                    : "bg-white text-institutional-muted border-brick/10 hover:border-brick/30 hover:bg-brick/5"
                                }
                              `}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div
                                    className={`
                                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                                  ${
                                    slot.selected
                                      ? "bg-white/20"
                                      : "bg-brick/5 group-hover:bg-brick/10"
                                  }
                                `}
                                  >
                                    {slot.selected ? (
                                      <FiCheck
                                        className="text-white"
                                        size={16}
                                      />
                                    ) : (
                                      <span className="text-[10px] font-black text-brick/40">
                                        {periodIdx + 1}
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`
                                  text-[9px] font-black uppercase tracking-widest
                                  ${slot.selected ? "text-white/80" : "text-institutional-muted"}
                                `}
                                  >
                                    SLOT
                                  </span>
                                </div>

                                {/* Hover Indicator */}
                                <div
                                  className={`
                                absolute inset-0 rounded-institutional border-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                ${slot.selected ? "border-gold" : "border-brick"}
                                `}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-brick/10">
                  <button
                    onClick={handleTimetableGeneration}
                    disabled={
                      !Object.values(checklist).every(Boolean) ||
                      selectedCount === 0 ||
                      isLoading
                    }
                    className="w-full px-8 py-4 bg-gradient-to-br from-gold to-gold-deep text-brick-deep rounded-institutional text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Generate Timetable ({selectedCount} Periods Active)
                  </button>
                </div>
              </div>
            )}

            <div className="mt-auto pt-8 border-t border-brick/5 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-institutional-muted italic">
              <span>Bells University Registry Engine v4.0</span>
              <span>Proprietary Institutional Asset</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;
