import React, { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

interface PeriodSlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (periods: number[]) => void;
  maxPeriods?: number;
  initialSelected?: number[];
}

/**
 * PeriodSlotSelector Component
 * Features:
 * - Compact grid layout for period selection
 * - Visual feedback for selected periods
 * - Smooth animations
 * - Confirm/Cancel buttons
 * - Designed to be date-picker-like and small
 */
const PeriodSlotSelector: React.FC<PeriodSlotSelectorProps> = ({
  isOpen,
  onClose,
  onConfirm,
  maxPeriods = 10,
  initialSelected = [],
}) => {
  const [selectedPeriods, setSelectedPeriods] =
    useState<number[]>(initialSelected);

  if (!isOpen) return null;

  const periods = Array.from({ length: maxPeriods }, (_, i) => i);

  const togglePeriod = (period: number) => {
    setSelectedPeriods((prev) =>
      prev.includes(period)
        ? prev.filter((p) => p !== period)
        : [...prev, period],
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedPeriods.sort((a, b) => a - b));
    onClose();
  };

  const handleCancel = () => {
    setSelectedPeriods(initialSelected);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brick/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={handleCancel}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="period-selector-title"
      >
        <div className="bg-surface rounded-institutional shadow-2xl border border-brick/10 pointer-events-auto w-full max-w-sm animate-fadeInUp">
          {/* Header */}
          <div className="px-6 py-4 border-b border-brick/10 flex items-center justify-between">
            <h2
              id="period-selector-title"
              className="text-sm font-black text-institutional-primary tracking-wide"
            >
              Select Exam Periods
            </h2>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-brick/10 rounded transition-colors"
              type="button"
              aria-label="Close"
            >
              <FiX className="w-4 h-4 text-institutional-muted" />
            </button>
          </div>

          {/* Period Grid */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-5 gap-3">
              {periods.map((period) => (
                <motion.button
                  key={period}
                  onClick={() => togglePeriod(period)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative w-12 h-12 rounded-institutional font-black text-sm
                    transition-all duration-200 border-2 flex items-center justify-center
                    ${
                      selectedPeriods.includes(period)
                        ? "bg-brick text-white border-brick shadow-md shadow-brick/30"
                        : "bg-page border-brick/10 text-institutional-primary hover:border-brick/30 hover:bg-brick/5"
                    }
                  `}
                  type="button"
                >
                  <span>{period}</span>
                  {selectedPeriods.includes(period) && (
                    <FiCheck className="absolute w-3 h-3 top-1 right-1" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Selected Count */}
            <div className="mt-6 p-3 bg-brick/5 rounded-institutional border border-brick/10">
              <p className="text-xs font-black uppercase tracking-widest text-brick">
                Selected: {selectedPeriods.length} Period
                {selectedPeriods.length !== 1 ? "s" : ""}
              </p>
              {selectedPeriods.length > 0 && (
                <p className="text-[10px] font-bold text-institutional-primary mt-1 mt-1">
                  {selectedPeriods.sort((a, b) => a - b).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-brick/10 flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-5 py-2 rounded-institutional border border-brick/20 text-institutional-primary text-xs font-black uppercase tracking-widest hover:bg-page transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedPeriods.length === 0}
              className="px-5 py-2 rounded-institutional bg-brick text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brick/20"
              type="button"
            >
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PeriodSlotSelector;
