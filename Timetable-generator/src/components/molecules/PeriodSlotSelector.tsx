import React, { useState, useMemo, useEffect } from "react";
import {
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiLock,
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  PeriodMapping,
  PeriodMappingResponse,
} from "../../types/institutional";

interface PeriodSlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (periods: number[]) => void;
  maxPeriods?: number;
  initialSelected?: number[];
  periodMapping?: PeriodMappingResponse | null;
  excludedPeriods?: number[];
}

/**
 * Enhanced PeriodSlotSelector Component
 * Mirrors the Temporal Matrix (CalendarGrid) UX in a compact format.
 */
const PeriodSlotSelector: React.FC<PeriodSlotSelectorProps> = ({
  isOpen,
  onClose,
  onConfirm,
  maxPeriods = 10,
  initialSelected = [],
  periodMapping,
  excludedPeriods = [],
}) => {
  const [selectedPeriods, setSelectedPeriods] =
    useState<number[]>(initialSelected);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setSelectedPeriods(initialSelected);
      if (initialSelected.length > 0 && periodMapping) {
        const firstSelected = periodMapping.periods.find(
          (p) => p.periodIndex === initialSelected[0],
        );
        if (firstSelected) setCurrentWeek(firstSelected.weekNumber);
      } else {
        setCurrentWeek(1);
      }
    }
  }, [isOpen, initialSelected, periodMapping]);

  const togglePeriod = (periodIndex: number) => {
    if (excludedPeriods.includes(periodIndex)) return;
    setSelectedPeriods((prev) =>
      prev.includes(periodIndex)
        ? prev.filter((p) => p !== periodIndex)
        : [...prev, periodIndex],
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedPeriods.sort((a, b) => a - b));
    onClose();
  };

  const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Mirror CalendarGrid Grouping Logic
  const weekData = useMemo(() => {
    if (!periodMapping) return null;

    const weeks: Record<
      number,
      { weekNumber: number; periods: PeriodMapping[] }
    > = {};
    periodMapping.periods.forEach((p) => {
      if (!weeks[p.weekNumber]) {
        weeks[p.weekNumber] = {
          weekNumber: p.weekNumber,
          periods: [],
        };
      }
      weeks[p.weekNumber].periods.push(p);
    });

    const currentWeekPeriods = weeks[currentWeek]?.periods || [];
    const distinctSlots = Array.from(
      new Set(currentWeekPeriods.map((p) => p.periodOfDay)),
    ).sort((a, b) => a - b);

    const weekdayDates: (string | null)[] = Array(7).fill(null);
    currentWeekPeriods.forEach((p) => {
      const d = new Date(p.date);
      const dayIdx = d.getDay();
      const adjustedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
      weekdayDates[adjustedIdx] = p.date;
    });

    const matrix = distinctSlots.map((slot) => ({
      slot,
      cols: Array.from({ length: 7 }, (_, dayIdx) =>
        currentWeekPeriods.find((p) => {
          const pd = new Date(p.date);
          const pDayIdx = pd.getDay();
          const adjustedPIdx = pDayIdx === 0 ? 6 : pDayIdx - 1;
          return adjustedPIdx === dayIdx && p.periodOfDay === slot;
        }),
      ),
    }));

    return {
      totalWeeks: Object.keys(weeks).length,
      weekdayDates,
      matrix,
    };
  }, [periodMapping, currentWeek]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-brick/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-surface rounded-institutional shadow-2xl border border-brick/10 pointer-events-auto w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-brick/10 flex items-center justify-between bg-page/50">
            <div>
              <h2 className="text-sm font-black text-institutional-primary flex items-center gap-2">
                <FiCalendar className="text-brick" />
                Temporal Matrix Selector
              </h2>
              <p className="text-[10px] text-institutional-muted font-bold uppercase tracking-widest mt-0.5">
                Precise slot selection for academic constraints
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-brick/10 rounded-full transition-colors"
            >
              <FiX className="w-4 h-4 text-institutional-muted" />
            </button>
          </div>

          {/* Week Pagination */}
          {weekData && weekData.totalWeeks > 1 && (
            <div className="px-6 py-3 bg-brick/5 border-b border-brick/10 flex items-center justify-between">
              <button
                disabled={currentWeek <= 1}
                onClick={() => setCurrentWeek((p) => p - 1)}
                className="p-1.5 rounded-lg border border-brick/10 hover:bg-white disabled:opacity-30 transition-all"
              >
                <FiChevronLeft className="text-brick" />
              </button>
              <div className="text-center">
                <span className="text-[10px] font-black text-brick uppercase tracking-[0.2em]">
                  Week {currentWeek} of {weekData.totalWeeks}
                </span>
              </div>
              <button
                disabled={currentWeek >= weekData.totalWeeks}
                onClick={() => setCurrentWeek((p) => p + 1)}
                className="p-1.5 rounded-lg border border-brick/10 hover:bg-white disabled:opacity-30 transition-all"
              >
                <FiChevronRight className="text-brick" />
              </button>
            </div>
          )}

          {/* Temporal Matrix Content */}
          <div className="flex-1 overflow-auto p-4 institutional-scroll">
            {weekData ? (
              <div className="min-w-[500px]">
                {/* Day Headers */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-3">
                  <div className="flex items-center justify-center p-2 rounded bg-brick/5">
                    <FiClock className="text-brick w-3 h-3" />
                  </div>
                  {dayLabels.map((label, idx) => (
                    <div
                      key={label}
                      className="text-center py-2 bg-page rounded border border-brick/5"
                    >
                      <p className="text-[9px] font-black text-brick uppercase tracking-tighter">
                        {label}
                      </p>
                      {weekData.weekdayDates[idx] && (
                        <p className="text-[7px] font-bold text-institutional-muted">
                          {new Date(weekData.weekdayDates[idx]!).getDate()}/
                          {new Date(weekData.weekdayDates[idx]!).getMonth() + 1}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Slot Rows */}
                <div className="space-y-2">
                  {weekData.matrix.map((row) => (
                    <div
                      key={row.slot}
                      className="grid grid-cols-[60px_repeat(7,1fr)] gap-2"
                    >
                      <div className="flex items-center justify-center bg-page rounded border border-brick/10">
                        <span className="text-[10px] font-black text-institutional-primary">
                          P{row.slot}
                        </span>
                      </div>
                      {row.cols.map((p, dayIdx) => {
                        const isSystemLocked = p?.isSystemLocked || false;
                        const isExcluded = p
                          ? excludedPeriods.includes(p.periodIndex) ||
                            isSystemLocked
                          : false;
                        return p ? (
                          <motion.button
                            key={p.periodIndex}
                            whileHover={
                              !isExcluded && !isSystemLocked
                                ? { scale: 1.05 }
                                : {}
                            }
                            whileTap={
                              !isExcluded && !isSystemLocked
                                ? { scale: 0.95 }
                                : {}
                            }
                            onClick={() =>
                              !isSystemLocked && togglePeriod(p.periodIndex)
                            }
                            className={`
                              period-button h-12 rounded-lg border flex flex-col items-center justify-center transition-all relative
                              ${
                                isSystemLocked
                                  ? "system-locked opacity-50"
                                  : isExcluded
                                    ? "excluded opacity-40"
                                    : selectedPeriods.includes(p.periodIndex)
                                      ? "bg-brick border-brick text-white shadow-md shadow-brick/20"
                                      : "available border-brick/5 text-institutional-primary hover:border-brick/20 hover:bg-brick/5"
                              }
                            `}
                          >
                            <span className="text-[10px] font-black">
                              {p.periodIndex}
                            </span>
                            {selectedPeriods.includes(p.periodIndex) &&
                              !isExcluded && (
                                <FiCheck className="absolute top-1 right-1 w-2.5 h-2.5" />
                              )}
                            {isExcluded && !isSystemLocked && (
                              <FiLock className="absolute top-1 right-1 w-2.5 h-2.5 text-brick/40" />
                            )}
                            {isSystemLocked && (
                              <FiLock className="absolute top-1 right-1 w-2.5 h-2.5 text-brick/60" />
                            )}
                          </motion.button>
                        ) : (
                          <div
                            key={`empty-${dayIdx}`}
                            className="h-12 rounded-lg bg-page/30 border border-dashed border-brick/5"
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Fallback to legacy grid if no mapping */
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: maxPeriods }, (_, i) => i).map((idx) => (
                  <button
                    key={idx}
                    onClick={() => togglePeriod(idx)}
                    className={`h-12 rounded-institutional border-2 flex items-center justify-center font-black transition-all ${
                      selectedPeriods.includes(idx)
                        ? "bg-brick text-white border-brick shadow-lg"
                        : "bg-page border-brick/10"
                    }`}
                  >
                    {idx}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary Footer */}
          <div className="px-6 py-4 border-t border-brick/10 bg-page/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-brick uppercase tracking-widest leading-none">
                {selectedPeriods.length} Windows Selected
              </span>
              <span className="text-[8px] font-bold text-institutional-muted mt-1 max-w-[300px] truncate italic">
                Indices:{" "}
                {selectedPeriods.length > 0
                  ? selectedPeriods.sort((a, b) => a - b).join(", ")
                  : "None"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-brick/20 rounded-institutional text-[10px] font-black uppercase tracking-widest text-institutional-primary hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedPeriods.length === 0}
                className="px-6 py-2 bg-brick text-white rounded-institutional text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brick/20 hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Apply Slots
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PeriodSlotSelector;
