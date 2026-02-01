import React, { useState, useRef, useEffect } from "react";
import { FiX, FiSearch } from "react-icons/fi";

export interface CourseOption {
  code: string;
  title: string;
}

interface InputChipProps {
  courseCode?: string;
  onRemove?: () => void;
  onSelect: (course: CourseOption) => void;
  availableCourses?: CourseOption[];
  options?: CourseOption[]; // Alias for availableCourses
  placeholder?: string;
  selectedPeriods?: number[];
  selectedVenues?: string[];
  isClickable?: boolean;
  onClick?: () => void;
}

/**
 * Institutional InputChip & Search Component
 * Dual-mode: Chip display OR Search input.
 */
const InputChip: React.FC<InputChipProps> = ({
  courseCode,
  onRemove,
  onSelect,
  availableCourses = [],
  options = [],
  placeholder = "Search...",
  isClickable = true,
  onClick,
  selectedPeriods = [],
  selectedVenues = [],
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(!courseCode);
  const [searchInput, setSearchInput] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const allOptions = options.length > 0 ? options : availableCourses;

  const filteredCourses = searchInput.trim()
    ? allOptions.filter(
        (c) =>
          c.code.toLowerCase().includes(searchInput.toLowerCase()) ||
          c.title.toLowerCase().includes(searchInput.toLowerCase()),
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        if (courseCode) setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [courseCode]);

  if (courseCode && !isSearchOpen) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-brick/10 border border-brick/30 rounded-full text-xs font-bold text-brick transition-all ${
          isClickable ? "cursor-pointer hover:bg-brick/20" : ""
        }`}
        onClick={isClickable ? onClick : undefined}
      >
        <span className="truncate max-w-[120px]">{courseCode}</span>
        {(selectedPeriods.length > 0 || selectedVenues.length > 0) && (
          <span className="text-[10px] opacity-70">
            {selectedPeriods.length > 0
              ? `(${selectedPeriods.join(",")})`
              : `(${selectedVenues.join(",")})`}
          </span>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-1 hover:bg-brick/30 rounded-full p-0.5"
          >
            <FiX size={12} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-institutional-muted"
          size={14}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-page border border-brick/20 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20"
          autoFocus
        />
      </div>

      {searchInput.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-brick/10 rounded-institutional shadow-xl z-50 max-h-48 overflow-y-auto">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <button
                key={course.code}
                onClick={() => {
                  onSelect(course);
                  setSearchInput("");
                  if (courseCode) setIsSearchOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-brick/5 border-b border-brick/5 last:border-0"
              >
                <div className="text-sm font-bold text-institutional-primary">
                  {course.code}
                </div>
                <div className="text-[10px] text-institutional-muted truncate">
                  {course.title}
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-institutional-muted italic text-center">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InputChip;
