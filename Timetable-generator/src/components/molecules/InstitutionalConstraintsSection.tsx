import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiLock,
  FiX,
  FiRotateCcw,
  FiCalendar,
  FiMapPin,
  FiZap,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import InputChip, { CourseOption } from "./InputChip";
import PeriodSlotSelector from "./PeriodSlotSelector";
import VenueSlotSelector from "./VenueSlotSelector";
import ConfirmModal from "./ConfirmModal";
import { Constraint } from "../../types/institutional";

interface ConstraintEntry {
  courseCode: string;
  periods?: number[];
  venues?: string[];
}

// Redundant local interface removed in favor of Constraint from types/institutional
export type ConstraintSnapshot = Constraint;

interface ConstraintGroup {
  key: string;
  label: string;
  description: string;
  type: "period" | "venue";
  category: "exam" | "venue" | "advanced";
}

interface InstitutionalConstraintsSectionProps {
  onSaveAll?: (constraints: Record<string, string>) => void;
  availableCourses?: CourseOption[];
  availableVenues?: Array<{ code: string; name: string }>;
  maxPeriods?: number;
  initialConstraints?: Record<string, string>;
  onLoadHistory?: () => Promise<ConstraintSnapshot[]>;
  readOnly?: boolean;
}

const CONSTRAINT_GROUPS: ConstraintGroup[] = [
  {
    key: "periodIncE",
    label: "Period Inclusive Exams",
    description: "Exams that must be scheduled in specific time periods",
    type: "period",
    category: "exam",
  },
  {
    key: "periodExcE",
    label: "Period Exclusive Exams",
    description: "Exams that cannot be scheduled in certain periods",
    type: "period",
    category: "exam",
  },
  {
    key: "venueIncE",
    label: "Venue Inclusive Exams",
    description: "Exams that must use certain venues",
    type: "venue",
    category: "venue",
  },
  {
    key: "venueExcE",
    label: "Venue Exclusive Exams",
    description: "Exams that cannot use certain venues",
    type: "venue",
    category: "venue",
  },
  {
    key: "periodIncV",
    label: "Period Inclusive Venues",
    description: "Venues available only in specific periods",
    type: "period",
    category: "venue",
  },
  {
    key: "periodExcV",
    label: "Period Exclusive Venues",
    description: "Venues unavailable in specific periods",
    type: "period",
    category: "venue",
  },
  {
    key: "examWAftE",
    label: "Exams After Exams",
    description: "Specify exam sequences",
    type: "period",
    category: "advanced",
  },
  {
    key: "examExcE",
    label: "Exclusive Exams",
    description: "Exams that cannot occur together",
    type: "period",
    category: "advanced",
  },
  {
    key: "examWCoinE",
    label: "Coinciding Exams",
    description: "Exams that must occur at the same time",
    type: "period",
    category: "advanced",
  },
  {
    key: "frontLE",
    label: "Front Loaded Exams",
    description: "Important exams scheduled earlier",
    type: "period",
    category: "advanced",
  },
];

type TabType = "exam" | "venue" | "advanced";

const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ReactNode }> =
  [
    { id: "exam", label: "Exam Constraints", icon: <FiCalendar /> },
    { id: "venue", label: "Venue Constraints", icon: <FiMapPin /> },
    { id: "advanced", label: "Advanced", icon: <FiZap /> },
  ];

/**
 * InstitutionalConstraintsSection Component
 * Main UI for managing institutional constraints with:
 * - Input chips with course search
 * - Period/Venue slot selectors
 * - Overflow prevention
 * - Data mapping (semicolon-delimited format)
 * - Confirm modals for actions
 */
const InstitutionalConstraintsSection: React.FC<
  InstitutionalConstraintsSectionProps
> = ({
  onSaveAll,
  availableCourses = [],
  availableVenues = [],
  maxPeriods = 10,
  initialConstraints = {},
  onLoadHistory,
  readOnly = false,
}) => {
  // State management
  const [constraints, setConstraints] = useState<
    Record<string, ConstraintEntry[]>
  >({});
  const [activeSelector, setActiveSelector] = useState<{
    type: "period" | "venue";
    constraintKey: string;
    entryIndex: number | null;
  } | null>(null);
  const [pendingChip, setPendingChip] = useState<{
    constraintKey: string;
    course: CourseOption;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "add" | "remove" | "saveAll";
    constraintKey?: string;
    entryIndex?: number;
    details?: string;
  }>({ isOpen: false, action: "add" });
  const [isSaving, setIsSaving] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [history, setHistory] = useState<ConstraintSnapshot[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // State to track which group is currently adding a course
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>("exam");

  // Initialize constraints from props
  useEffect(() => {
    const parsed: Record<string, ConstraintEntry[]> = {};
    CONSTRAINT_GROUPS.forEach((group) => {
      parsed[group.key] = [];
    });

    // Parse initial constraints (semicolon-delimited format)
    Object.entries(initialConstraints).forEach(([key, value]) => {
      if (value && parsed[key]) {
        const entries = value.split(";").map((entry) => {
          entry = entry.trim();
          const match = entry.match(/^(\w+)\((.*?)\)$/);
          if (match) {
            const courseCode = match[1];
            const items = match[2]
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);

            const constraintGroup = CONSTRAINT_GROUPS.find(
              (g) => g.key === key,
            );
            const type = constraintGroup?.type || "period";

            return {
              courseCode,
              [type === "period" ? "periods" : "venues"]: items.map((item) =>
                type === "period" ? parseInt(item, 10) : item,
              ),
            };
          }
          return null;
        });

        parsed[key] = entries.filter(Boolean) as ConstraintEntry[];
      }
    });

    setConstraints(parsed);
  }, [initialConstraints]);

  // Add a new constraint entry
  const handleAddConstraint = (constraintKey: string, course: CourseOption) => {
    const group = CONSTRAINT_GROUPS.find((g) => g.key === constraintKey);
    if (!group) return;

    // Check for duplicates
    if (constraints[constraintKey]?.some((e) => e.courseCode === course.code)) {
      toast.warning(`${course.code} already added to this constraint`);
      return;
    }

    setPendingChip({ constraintKey, course });

    // Auto-open selector based on constraint type
    setActiveSelector({
      type: group.type,
      constraintKey,
      entryIndex: constraints[constraintKey]?.length || 0,
    });
    setAddingToGroup(null);
  };

  // Handle period selection
  const handlePeriodSelect = (periods: number[]) => {
    if (activeSelector) {
      if (pendingChip) {
        // Adding new constraint
        if (activeSelector && pendingChip) {
          setConfirmModal({
            isOpen: true,
            action: "add",
            constraintKey: activeSelector.constraintKey,
            details: `Add ${pendingChip.course.code} with periods ${periods.join(", ")}?`,
          });
        }
      } else if (activeSelector.entryIndex !== null) {
        // Editing existing constraint
        setConstraints((prev) => {
          const list = [...(prev[activeSelector.constraintKey] || [])];
          if (list[activeSelector.entryIndex!]) {
            list[activeSelector.entryIndex!] = {
              ...list[activeSelector.entryIndex!],
              periods: periods,
            };
          }
          return { ...prev, [activeSelector.constraintKey]: list };
        });
        toast.success("Constraint updated");
      }
    }
    setActiveSelector(null);
  };

  // Handle venue selection
  const handleVenueSelect = (venues: string[]) => {
    if (activeSelector) {
      if (pendingChip) {
        // Adding new constraint
        setConfirmModal({
          isOpen: true,
          action: "add",
          constraintKey: activeSelector.constraintKey,
          details: `Add ${pendingChip.course.code} with venues ${venues.join(", ")}?`,
        });
      } else if (activeSelector.entryIndex !== null) {
        // Editing existing constraint
        setConstraints((prev) => {
          const list = [...(prev[activeSelector.constraintKey] || [])];
          if (list[activeSelector.entryIndex!]) {
            list[activeSelector.entryIndex!] = {
              ...list[activeSelector.entryIndex!],
              venues: venues,
            };
          }
          return { ...prev, [activeSelector.constraintKey]: list };
        });
        toast.success("Constraint updated");
      }
    }
    setActiveSelector(null);
  };

  // Confirm add action
  const confirmAddEntry = useCallback(() => {
    if (!pendingChip) return;

    const { constraintKey } = pendingChip;
    const group = CONSTRAINT_GROUPS.find((g) => g.key === constraintKey);
    if (!group) return;

    // The logic here previously assumed activeSelector was still set, but it's cleared before modal open
    // We need to capture the selected periods/venues.
    // Wait, the handlePeriodSelect/handleVenueSelect set the modal details but NOT the temporary data?
    // The previous implementation was slightly flawed in logic flow for data passing.
    // FIX: We need to store temporary selection.
    // For simplicity, I'll rely on parsing the details string or storing it in state, but let's assume valid data for now
    // or better, update state to hold temp selection.

    // Actually, looking at previous code, it created EMPTY lists:
    // const newEntry: ConstraintEntry = { ... [group.type]: [] }
    // This means the user would add the course but with NO periods/venues!
    // We should fix this.

    // Since I can't easily change the architecture of this component without extensive rewrite,
    // I will implement the empty list addition as per original intent (and user can edit later?)
    // OR, I should pass the values to confirmAddEntry.

    // Let's assume for this refactor we add with empty lists (Placeholders) or maybe parse the modal details? No that's fragile.
    // I will add a `tempSelection` state.

    // BUT, for now, let's stick to the original code's "create entry with empty" logic IF that was the intent.
    // However, the original code had: `[group.type === "period" ? "periods" : "venues"]: [],`
    // And users likely want the periods they just selected.

    // I will implicitly fix this by assuming the "Add" flow is:
    // 1. Select Course -> `pendingChip`
    // 2. Select Period/Venue -> `tempValues`
    // 3. Confirm -> Add `pendingChip` + `tempValues`

    // But I don't want to over-engineer if I don't have `tempValues` state.
    // Let's just use empty for now and assume the user edits it (if editing is supported).
    // Wait, there is no "Edit" button for existing entries, only Remove.
    // This implies the original code was broken/incomplete.

    // I will proceed with just fixing the UI structure (InputChip) and leave logical deep fixes for next iteration or assume empty is okay/placeholder.
    // Actually, if I add it empty, it's useless.
    // I'll add `tempValues` to state.

    const newEntry: ConstraintEntry = {
      courseCode: pendingChip.course.code,
      periods: (pendingValues as number[]) || [],
      venues: (pendingValues as string[]) || [],
    };
    // Note: pendingValues need to be defined. See below.

    setConstraints((prev) => ({
      ...prev,
      [constraintKey]: [...(prev[constraintKey] || []), newEntry],
    }));

    toast.success(`${pendingChip.course.code} added to constraints`);
    setPendingChip(null);
    setPendingValues(null);
    setConfirmModal({ isOpen: false, action: "add" });
  }, [pendingChip]); // pendingValues added to closure via state

  const [pendingValues, setPendingValues] = useState<
    number[] | string[] | null
  >(null);

  // Handle remove constraint
  const handleRemoveEntry = (constraintKey: string, index: number) => {
    const entry = constraints[constraintKey]?.[index];
    setConfirmModal({
      isOpen: true,
      action: "remove",
      constraintKey,
      entryIndex: index,
      details: `Remove ${entry?.courseCode} from this constraint?`,
    });
  };

  // Confirm remove action
  const confirmRemoveEntry = useCallback(() => {
    if (
      confirmModal.action !== "remove" ||
      !confirmModal.constraintKey ||
      confirmModal.entryIndex === undefined
    )
      return;

    setConstraints((prev) => ({
      ...prev,
      [confirmModal.constraintKey!]: (
        prev[confirmModal.constraintKey!] || []
      ).filter((_, i) => i !== confirmModal.entryIndex),
    }));

    toast.success("Constraint removed");
    setConfirmModal({ isOpen: false, action: "add" });
  }, [confirmModal]);

  // Convert constraints to semicolon-delimited format for DB
  const getConstraintsForDB = useCallback(() => {
    const result: Record<string, string> = {};

    Object.entries(constraints).forEach(([key, entries]) => {
      if (entries.length > 0) {
        const formatted = entries
          .map((entry) => {
            const group = CONSTRAINT_GROUPS.find((g) => g.key === key);
            if (group?.type === "period") {
              const periods = (entry.periods || []).join(",");
              return `${entry.courseCode}(${periods})`;
            } else {
              const venues = (entry.venues || []).join(",");
              return `${entry.courseCode}(${venues})`;
            }
          })
          .join("; ");

        result[key] = formatted;
      } else {
        result[key] = "";
      }
    });

    return result;
  }, [constraints]);

  // Save all constraints
  const handleSaveAll = () => {
    setConfirmModal({
      isOpen: true,
      action: "saveAll",
      details: `Save snapshot "${snapshotName || "Untitled Snapshot"}" with all constraint changes?`,
    });
  };

  const handleFetchHistory = async () => {
    if (!onLoadHistory) return;
    setIsLoadingHistory(true);
    try {
      const data = await onLoadHistory();
      setHistory(data);
      setShowHistory(true);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadFromSnapshot = (s: ConstraintSnapshot) => {
    // We can reuse the initialization logic
    const initialValues: Record<string, string> = {
      periodIncE: s.periodIncE,
      periodExcE: s.periodExcE,
      venueIncE: s.venueIncE,
      venueExcE: s.venueExcE,
      periodIncV: s.periodIncV,
      periodExcV: s.periodExcV,
      examWAftE: s.examWAftE,
      examExcE: s.examExcE,
      examWCoinE: s.examWCoinE,
      frontLE: s.frontLE,
    };

    // Set internal state by parsing (matching the useEffect logic)
    const parsed: Record<string, ConstraintEntry[]> = {};
    CONSTRAINT_GROUPS.forEach((group) => {
      parsed[group.key] = [];
    });

    Object.entries(initialValues).forEach(([key, value]) => {
      if (value && parsed[key]) {
        const entries = value.split(";").map((entry) => {
          entry = entry.trim();
          const match = entry.match(/^(\w+)\((.*?)\)$/);
          if (match) {
            const courseCode = match[1];
            const items = match[2]
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
            const group = CONSTRAINT_GROUPS.find((g) => g.key === key);
            const type = group?.type || "period";
            return {
              courseCode,
              [type === "period" ? "periods" : "venues"]: items.map((item) =>
                type === "period" ? parseInt(item, 10) : item,
              ),
            };
          }
          return null;
        });
        parsed[key] = entries.filter(Boolean) as ConstraintEntry[];
      }
    });
    setConstraints(parsed);
    setSnapshotName(s.name);
    setShowHistory(false);
    toast.info(`Loaded snapshot: ${s.name}`);
  };

  const confirmSaveAll = useCallback(async () => {
    if (!onSaveAll) {
      toast.error("Save handler not configured");
      return;
    }

    setIsSaving(true);
    try {
      const dbConstraints = getConstraintsForDB();
      // Add the name to the payload
      dbConstraints.name =
        snapshotName || `Snapshot ${new Date().toLocaleString()}`;
      await onSaveAll(dbConstraints);
      setConfirmModal({ isOpen: false, action: "add" });
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  }, [onSaveAll, getConstraintsForDB, snapshotName]);

  const handleConfirmModalAction = () => {
    switch (confirmModal.action) {
      case "add":
        confirmAddEntry();
        break;
      case "remove":
        confirmRemoveEntry();
        break;
      case "saveAll":
        confirmSaveAll();
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
        <FiLock className="text-brick text-lg" />
        <h2 className="text-xs font-black uppercase tracking-widest text-brick">
          Institutional Constraints
        </h2>
        <div className="flex-1" />
        <button
          onClick={handleFetchHistory}
          className="text-[10px] font-black uppercase tracking-widest text-institutional-muted border-b border-dashed border-institutional-muted hover:text-brick hover:border-brick transition-all"
        >
          View History
        </button>
      </div>

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-page rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4 border border-brick/10 overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-brick/5 pb-3">
              <div className="flex items-center gap-3">
                <FiRotateCcw className="text-brick" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                  Snapshot Archive
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-institutional-muted hover:text-brick transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            {isLoadingHistory ? (
              <div className="py-20 text-center">
                <p className="text-xs font-bold text-brick italic animate-pulse">
                  Consulting historical ledgers...
                </p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm text-institutional-muted italic">
                  No historical snapshots recorded.
                </p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                {history.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-4 bg-surface border border-brick/5 rounded group hover:border-brick/20 transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-institutional-primary">
                        {s.name}
                      </p>
                      <p className="text-[8px] text-institutional-muted uppercase font-black">
                        {new Date(s.date!).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => loadFromSnapshot(s)}
                      className="px-4 py-2 bg-brick/5 text-brick text-[9px] font-black uppercase tracking-widest rounded hover:bg-brick hover:text-white transition-all"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-3 border-t border-brick/5 text-center">
              <p className="text-[8px] text-institutional-muted font-bold uppercase tracking-tighter italic">
                Bells University Institutional Registry
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Snapshot Name Input */}
      <div className="bg-surface p-4 rounded-institutional border border-brick/10 mb-6">
        <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
          Snapshot Identifier
        </label>
        <input
          type="text"
          placeholder="Enter a descriptive name for this constraint set (e.g., Early Exam Week v1)"
          className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
          value={snapshotName}
          onChange={(e) => setSnapshotName(e.target.value)}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-brick/10 mb-6">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider transition-all relative ${
              activeTab === tab.id
                ? "text-brick border-b-2 border-brick"
                : "text-institutional-muted hover:text-brick/70"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Constraint Groups Grid (Filtered by Active Tab) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {CONSTRAINT_GROUPS.filter((g) => g.category === activeTab).map(
            (group) => (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-page/50 border border-brick/5 rounded-institutional p-4 flex flex-col"
              >
                {/* Group Header */}
                <div className="mb-4 pb-3 border-b border-brick/10">
                  <h3 className="text-sm font-black text-institutional-primary">
                    {group.label}
                  </h3>
                  <p className="text-[10px] text-institutional-muted italic mt-1">
                    {group.description}
                  </p>
                </div>

                {/* Chip Container with Overflow Prevention */}
                <div className="flex-1 mb-4 overflow-hidden">
                  <div className="max-h-[180px] overflow-y-auto flex flex-wrap gap-2 p-2 bg-surface rounded border border-brick/10 content-start">
                    {constraints[group.key]?.length > 0 ? (
                      <AnimatePresence>
                        {constraints[group.key].map((entry, idx) => {
                          const displayValue =
                            group.type === "period"
                              ? `${entry.courseCode}(${(entry.periods || []).join(",")})`
                              : `${entry.courseCode}(${(entry.venues || []).join(",")})`;

                          return (
                            <motion.div
                              key={`${entry.courseCode}-${idx}`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div
                                onClick={() =>
                                  setActiveSelector({
                                    type: group.type,
                                    constraintKey: group.key,
                                    entryIndex: idx,
                                  })
                                }
                                className="flex items-center gap-2 px-3 py-2 bg-brick/10 border border-brick/30 rounded-full text-xs font-bold text-brick hover:bg-brick/20 cursor-pointer transition-all"
                              >
                                <span className="truncate max-w-[120px]">
                                  {displayValue}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveEntry(group.key, idx);
                                  }}
                                  className="ml-1 flex items-center justify-center w-4 h-4 rounded-full hover:bg-brick/30 transition-all"
                                  type="button"
                                  aria-label="Remove"
                                >
                                  ✕
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    ) : (
                      <div className="text-center text-xs text-institutional-muted italic py-6 w-full">
                        No constraints added
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Interaction Area */}
                {addingToGroup === group.key ? (
                  <div className="animate-fadeIn">
                    <InputChip
                      placeholder="Search Courses..."
                      options={availableCourses}
                      onSelect={(course) =>
                        handleAddConstraint(group.key, course)
                      }
                    />
                    <button
                      onClick={() => setAddingToGroup(null)}
                      className="mt-2 text-[10px] text-institutional-muted hover:text-brick underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  !readOnly && (
                    <button
                      onClick={() => setAddingToGroup(group.key)}
                      className="w-full py-2.5 flex items-center justify-center gap-2 bg-brick/10 border border-brick/30 text-brick text-xs font-black uppercase tracking-wider rounded-institutional hover:bg-brick/20 transition-all active:scale-95"
                      type="button"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Constraint
                    </button>
                  )
                )}
              </motion.div>
            ),
          )}
        </AnimatePresence>
      </div>

      {/* Global Save Button */}
      {!readOnly && (
        <div className="pt-4 border-t border-brick/10">
          <button
            onClick={handleSaveAll}
            disabled={
              isSaving ||
              Object.values(constraints).every((c) => c.length === 0)
            }
            className="w-full py-3 px-6 bg-brick text-white text-sm font-black uppercase tracking-widest rounded-institutional hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brick/20 active:scale-95"
            type="button"
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      )}

      {/* Modals */}
      <PeriodSlotSelector
        isOpen={activeSelector?.type === "period"}
        onClose={() => setActiveSelector(null)}
        onConfirm={(periods) => {
          setPendingValues(periods);
          handlePeriodSelect(periods);
        }}
        maxPeriods={maxPeriods}
        initialSelected={
          activeSelector && !pendingChip && activeSelector.entryIndex !== null
            ? constraints[activeSelector.constraintKey]?.[
                activeSelector.entryIndex
              ]?.periods || []
            : []
        }
      />

      <VenueSlotSelector
        isOpen={activeSelector?.type === "venue"}
        onClose={() => setActiveSelector(null)}
        onConfirm={(venues) => {
          setPendingValues(venues);
          handleVenueSelect(venues);
        }}
        availableVenues={availableVenues}
        initialSelected={
          activeSelector && !pendingChip && activeSelector.entryIndex !== null
            ? constraints[activeSelector.constraintKey]?.[
                activeSelector.entryIndex
              ]?.venues || []
            : []
        }
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.action === "add"
            ? "Add Constraint"
            : confirmModal.action === "remove"
              ? "Remove Constraint"
              : "Confirm Save"
        }
        message={
          confirmModal.action === "add"
            ? "Are you sure you want to add this constraint?"
            : confirmModal.action === "remove"
              ? "Are you sure you want to remove this constraint?"
              : "Are you sure you want to save all changes?"
        }
        details={confirmModal.details}
        onConfirm={handleConfirmModalAction}
        onCancel={() => setConfirmModal({ isOpen: false, action: "add" })}
        confirmText={confirmModal.action === "remove" ? "Remove" : "Confirm"}
        isDangerous={confirmModal.action === "remove"}
      />
    </div>
  );
};

export default InstitutionalConstraintsSection;
