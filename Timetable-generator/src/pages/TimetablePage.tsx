import React, { useState } from "react";
import {
  FiCalendar,
  FiLayers,
  FiBook,
  FiDownload,
  FiInfo,
  FiChevronRight,
  FiActivity,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

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
  const [session, setSession] = useState("");
  const [semester, setSemester] = useState("First");
  const [periodsPerDay, setPeriodsPerDay] = useState(2);
  const [examStartDate, setExamStartDate] = useState("");
  const [examEndDate, setExamEndDate] = useState("");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Interactive Grid State
  const [gridInitialized, setGridInitialized] = useState(false);
  const [periodSlots, setPeriodSlots] = useState<PeriodSlot[]>([]);

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const generateCsv = async () => {
    try {
      const res = await fetch("http://localhost:8080/course/export");
      const message = await res.text();
      toast.info(`Institutional Export: ${message}`);
    } catch (err) {
      toast.error("CSV Export failure detected");
    }
  };

  const initializeGrid = () => {
    const newErrors: Record<string, boolean> = {};
    if (!examStartDate) newErrors.examStartDate = true;
    if (!examEndDate) newErrors.examEndDate = true;
    if (periodsPerDay < 1) newErrors.periodsPerDay = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.warn("Compliance Error: Missing mandatory academic parameters");
      return;
    }

    const start = new Date(examStartDate);
    const end = new Date(examEndDate);
    if (end < start) {
      setErrors({ examStartDate: true, examEndDate: true });
      toast.error(
        "Temporal Error: Commencement date cannot exceed Termination",
      );
      return;
    }

    setErrors({}); // Clear errors on success

    // Generate all possible period slots for the week
    const slots: PeriodSlot[] = [];
    dayNames.forEach((day) => {
      for (let period = 1; period <= periodsPerDay; period++) {
        slots.push({
          id: `${day}-P${period}`,
          day,
          period,
          selected: true, // Default: all selected
        });
      }
    });

    setPeriodSlots(slots);
    setGridInitialized(true);
    toast.success("Calendar grid initialized successfully");
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

  const handleMainInterface = async () => {
    // 1. Mandatory Fields Check
    const newErrors: Record<string, boolean> = {};
    if (!session) newErrors.session = true;
    if (!semester) newErrors.semester = true;
    if (!examStartDate) newErrors.examStartDate = true;
    if (!examEndDate) newErrors.examEndDate = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.warn("Verify all mandatory institutional academic fields");
      return;
    }

    // 2. Session Format Validation (YYYY/YYYY)
    const sessionRegex = /^\d{4}\/\d{4}$/;
    if (!sessionRegex.test(session)) {
      setErrors({ session: true });
      toast.error("Format Error: Session must be YYYY/YYYY (e.g., 2024/2025)");
      return;
    }

    // 3. Chronological Date Validation
    const start = new Date(examStartDate);
    const end = new Date(examEndDate);
    if (end < start) {
      setErrors({ examStartDate: true, examEndDate: true });
      toast.error(
        "Temporal Error: Termination date cannot precede Commencement",
      );
      return;
    }

    setErrors({});

    const selectedSlots = periodSlots.filter((slot) => slot.selected);
    if (selectedSlots.length === 0) {
      toast.warn("Select at least one period to proceed");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/main/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session,
          semester,
          start_date: examStartDate,
          end_date: examEndDate,
          days_per_week: 7,
          periods_per_day: periodsPerDay,
          selected_periods: selectedSlots.map((s) => s.id),
        }),
      });
      if (res.ok) toast.success("Academic master state committed to database");
      else toast.error("Institutional state sync failed");
    } catch (error) {
      toast.error("Critical failure during master state commit");
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
        {/* Configuration Column */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-surface p-6 rounded-institutional border border-brick/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-brick/5 pb-4">
              <FiCalendar className="text-brick text-lg" />
              <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                Academic Framework
              </h2>
            </div>

            <div className="space-y-4">
              <div className="group relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2 flex items-center justify-between">
                  Academic Session
                  <FiInfo
                    size={12}
                    className="text-brick/40"
                    onMouseEnter={() => setActiveTooltip("session")}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                </label>
                <input
                  type="text"
                  placeholder="eg. 2024/2025"
                  className={`w-full bg-page border px-4 py-3 rounded-institutional font-bold text-sm focus:ring-2 focus:ring-brick/20 outline-none transition-all ${
                    errors.session
                      ? "border-status-error ring-1 ring-status-error/20"
                      : "border-brick/10"
                  }`}
                  value={session}
                  onChange={(e) => {
                    setSession(e.target.value);
                    if (errors.session)
                      setErrors((prev) => ({ ...prev, session: false }));
                  }}
                />
                <AnimatePresence>
                  {activeTooltip === "session" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute z-10 top-[-35px] right-0 bg-brick text-white px-2 py-1 text-[9px] rounded font-bold"
                    >
                      YYYY/YYYY format
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                  Semester Cycle
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-page border border-brick/10 px-4 py-3 rounded-institutional font-bold text-sm focus:ring-2 focus:ring-brick/20 outline-none appearance-none"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option>First</option>
                    <option>Second</option>
                  </select>
                  <FiChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brick/40" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface p-6 rounded-institutional border border-brick/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-brick/5 pb-4">
              <FiLayers className="text-brick text-lg" />
              <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                Temporal Constraints
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                  Commencement
                </label>
                <input
                  type="date"
                  className={`w-full bg-page border px-3 py-2 rounded text-xs font-bold ${
                    errors.examStartDate
                      ? "border-status-error ring-1 ring-status-error/20"
                      : "border-brick/10"
                  }`}
                  value={examStartDate}
                  onChange={(e) => {
                    setExamStartDate(e.target.value);
                    if (errors.examStartDate)
                      setErrors((prev) => ({ ...prev, examStartDate: false }));
                  }}
                />
              </div>
              <div className="input-group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                  Termination
                </label>
                <input
                  type="date"
                  className={`w-full bg-page border px-3 py-2 rounded text-xs font-bold ${
                    errors.examEndDate
                      ? "border-status-error ring-1 ring-status-error/20"
                      : "border-brick/10"
                  }`}
                  value={examEndDate}
                  onChange={(e) => {
                    setExamEndDate(e.target.value);
                    if (errors.examEndDate)
                      setErrors((prev) => ({ ...prev, examEndDate: false }));
                  }}
                />
              </div>
            </div>
          </section>

          <section className="bg-surface p-6 rounded-institutional border border-brick/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-brick/5 pb-4">
              <FiBook className="text-brick text-lg" />
              <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                Load Determinants
              </h2>
            </div>

            <div className="input-group">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                Periods / Day
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={periodsPerDay}
                onChange={(e) => {
                  setPeriodsPerDay(Number(e.target.value));
                  if (errors.periodsPerDay)
                    setErrors((prev) => ({ ...prev, periodsPerDay: false }));
                }}
                className={`w-full bg-page border px-3 py-2 rounded text-xs font-bold ${
                  errors.periodsPerDay
                    ? "border-status-error ring-1 ring-status-error/20"
                    : "border-brick/10"
                }`}
              />
            </div>

            <div className="p-4 bg-brick/5 rounded border border-brick/10">
              <button
                onClick={initializeGrid}
                className="w-full px-6 py-2.5 bg-brick text-white rounded text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brick/20 hover:scale-105 active:scale-95 transition-all"
              >
                Initialize Grid
              </button>
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
                  {Array.from({ length: periodsPerDay }, (_, periodIdx) => (
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
                            (s) => s.day === day && s.period === periodIdx + 1,
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
                                    <FiCheck className="text-white" size={16} />
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
                  ))}
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-brick/10">
                  <button
                    onClick={handleMainInterface}
                    disabled={selectedCount === 0}
                    className="w-full px-8 py-4 bg-gradient-to-br from-gold to-gold-deep text-brick-deep rounded-institutional text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Commit Schedule Configuration ({selectedCount} Periods)
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
