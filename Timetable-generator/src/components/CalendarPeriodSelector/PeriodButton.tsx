import React from "react";
import "./CalendarPeriodSelector.css";

interface PeriodButtonProps {
  displayNumber: number; // 1-based frontend display (for tooltip/aria)
  label: string; // Text to display on button (e.g. "P1")
  date: Date | string;
  periodOfDay: number;
  isExcluded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isSystemLocked?: boolean;
}

export const PeriodButton: React.FC<PeriodButtonProps> = ({
  displayNumber,
  label,
  date,
  periodOfDay,
  isExcluded,
  onToggle,
  disabled = false,
  isSystemLocked = false,
}) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Format: "Mon 20 Jan"
  const dateStr = dateObj.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  // Format: "Monday 20th January"
  const fullDateStr = dateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const tooltip = `${dateStr} - Period ${periodOfDay} (Slot ${displayNumber})${isSystemLocked ? " [SYSTEM LOCKED]" : ""}`;
  const ariaLabel = `${isSystemLocked ? "LOCKED: " : ""}Period ${displayNumber}, ${fullDateStr}, ${
    isExcluded ? "Excluded" : "Available"
  }`;

  return (
    <button
      type="button"
      className={`period-button ${
        isSystemLocked ? "system-locked" : isExcluded ? "excluded" : "available"
      }`}
      onClick={onToggle}
      disabled={disabled || isSystemLocked}
      title={tooltip}
      aria-label={ariaLabel}
    >
      {isSystemLocked ? "" : label}
    </button>
  );
};
