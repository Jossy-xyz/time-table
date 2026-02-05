import React from "react";
import { COLLEGES, CollegeInfo } from "../../constants/colleges";
import "./CollegeSelector.css";

interface CollegeSelectorProps {
  selectedCollege: CollegeInfo | null;
  onSelectCollege: (college: CollegeInfo) => void;
  compact?: boolean;
}

/**
 * Institutional College Selector
 * Features: High-contrast academic badges and subtle status indicators.
 */
const CollegeSelector: React.FC<CollegeSelectorProps> = ({
  selectedCollege,
  onSelectCollege,
  compact = false,
}) => {
  const colleges = Object.values(COLLEGES);

  return (
    <div
      className={`college-selector space-y-4 ${compact ? "college-selector-compact" : ""}`}
    >
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-institutional-muted">
        {compact ? "Unit" : "Academic Body Selection"}
      </label>

      <div className="college-selector-grid flex flex-wrap gap-3">
        {colleges.map((college) => (
          <button
            key={college.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-institutional border transition-all ${
              selectedCollege?.id === college.id
                ? "bg-brick text-white border-brick shadow-md"
                : "bg-surface text-institutional-primary border-brick/10 hover:border-brick/30"
            }`}
            onClick={() => onSelectCollege(college)}
            aria-pressed={selectedCollege?.id === college.id}
            aria-label={`Select ${college.name}`}
            title={college.description}
          >
            <span
              className={`text-xl transition-transform ${selectedCollege?.id === college.id ? "scale-110" : "grayscale opacity-50"}`}
            >
              {college.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {college.shortName}
            </span>
            {selectedCollege?.id === college.id && (
              <div className="w-1 h-1 rounded-full bg-gold animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {selectedCollege && !compact && (
        <p className="flex items-center gap-2 p-3 bg-brick/5 rounded-institutional border border-brick/5 animate-fadeIn">
          <span className="text-[10px] font-black uppercase tracking-widest text-brick">
            Affiliated:
          </span>
          <span className="text-xs font-bold text-institutional-primary italic">
            {selectedCollege.name}
          </span>
        </p>
      )}
    </div>
  );
};

export default CollegeSelector;
