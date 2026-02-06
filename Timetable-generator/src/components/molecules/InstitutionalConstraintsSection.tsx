import React, { useState, useEffect, useCallback } from "react";
import {
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
import RegistryPicker from "./RegistryPicker";
import ConfirmModal from "./ConfirmModal";
import { Constraint, PeriodMappingResponse } from "../../types/institutional";

interface ConstraintEntry {
  courseCode: string;
  periods?: number[];
  venues?: string[];
}

export type ConstraintSnapshot = Constraint;

interface ConstraintGroup {
  key: string;
  label: string;
  description: string;
  type: "period" | "venue" | "none";
  category: "exam" | "venue" | "advanced" | "invigilator";
  isCollective?: boolean;
}

interface InstitutionalConstraintsSectionProps {
  onSaveAll?: (constraints: Record<string, string>) => void;
  availableCourses?: CourseOption[];
  availableVenues?: Array<{ code: string; name: string }>;
  availableStaff?: Array<{ code: string; title: string }>;
  maxPeriods?: number;
  initialConstraints?: Record<string, string>;
  onLoadHistory?: () => Promise<ConstraintSnapshot[]>;
  periodMapping?: PeriodMappingResponse | null;
  excludedPeriods?: number[];
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
    type: "venue",
    category: "advanced",
  },
  {
    key: "examExcE",
    label: "Exclusive Exams",
    description: "Exams that cannot occur together",
    type: "venue",
    category: "advanced",
    isCollective: true,
  },
  {
    key: "examWCoinE",
    label: "Coinciding Exams",
    description: "Exams that must occur at the same time",
    type: "venue",
    category: "advanced",
    isCollective: true,
  },
  {
    key: "frontLE",
    label: "Front Loaded Exams",
    description: "Important exams scheduled earlier",
    type: "none",
    category: "advanced",
  },
  {
    key: "staffOmit",
    label: "Staff Omission",
    description: "Staff members unavailable for all examination duties",
    type: "none",
    category: "invigilator",
  },
  {
    key: "staffPeriodExcl",
    label: "Invigilator Exclusions",
    description:
      "Specific periods where staff are unavailable for invigilation",
    type: "period",
    category: "invigilator",
  },
];

type TabType = "exam" | "venue" | "advanced" | "invigilator";

const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ReactNode }> =
  [
    { id: "exam", label: "Exam Constraints", icon: <FiCalendar /> },
    { id: "venue", label: "Venue Constraints", icon: <FiMapPin /> },
    { id: "advanced", label: "Advanced", icon: <FiZap /> },
    { id: "invigilator", label: "Invigilator", icon: <FiLock /> },
  ];

const InstitutionalConstraintsSection: React.FC<
  InstitutionalConstraintsSectionProps
> = ({
  onSaveAll,
  availableCourses = [],
  availableVenues = [],
  availableStaff = [],
  maxPeriods = 10,
  initialConstraints = {},
  onLoadHistory,
  periodMapping = null,
  excludedPeriods = [],
  readOnly = false,
}) => {
  const [constraints, setConstraints] = useState<
    Record<string, ConstraintEntry[]>
  >({});
  const [activeSelector, setActiveSelector] = useState<{
    type: "period" | "venue" | "none";
    constraintKey: string;
    category: string;
    entryIndex: number | null;
    isCollective?: boolean;
  } | null>(null);
  const [pendingChip, setPendingChip] = useState<{
    constraintKey: string;
    course: CourseOption;
  } | null>(null);
  const [pendingValues, setPendingValues] = useState<
    number[] | string[] | null
  >(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: "add" | "remove" | "saveAll";
    constraintKey?: string;
    entryIndex?: number;
    details?: string;
  }>({ isOpen: false, action: "add" });
  const [isSaving, setIsSaving] = useState(false);
  const [snapshotName, setSnapshotName] = useState("Constraints_Draft_1");
  const [history, setHistory] = useState<ConstraintSnapshot[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("exam");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const parsed: Record<string, ConstraintEntry[]> = {};
    CONSTRAINT_GROUPS.forEach((group) => {
      parsed[group.key] = [];
    });

    Object.entries(initialConstraints).forEach(([key, value]) => {
      if (value && parsed[key]) {
        const entries = value
          .split(";")
          .map((entry): ConstraintEntry | null => {
            entry = entry.trim();
            const match = entry.match(/^([^(\s]+)(?:\((.*?)\))?$/);
            if (match) {
              const code = match[1];
              const itemsStr =
                match[2] || (key === "staffOmit" ? "SELECTED" : "");
              const items = itemsStr
                ? itemsStr
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : [];
              const constraintGroup = CONSTRAINT_GROUPS.find(
                (g) => g.key === key,
              );
              const type = constraintGroup?.type || "period";

              const entryObj: ConstraintEntry = { courseCode: code };
              if (type === "period") {
                entryObj.periods = items.map((item) => parseInt(item, 10));
              } else {
                entryObj.venues = items;
              }
              return entryObj;
            }
            return null;
          });
        parsed[key] = entries.filter((e): e is ConstraintEntry => e !== null);
      }
    });
    setConstraints(parsed);
  }, [initialConstraints]);

  const updateConstraint = (
    constraintKey: string,
    index: number,
    updates: Partial<ConstraintEntry>,
  ) => {
    setConstraints((prev) => {
      const list = [...(prev[constraintKey] || [])];
      if (list[index]) {
        list[index] = { ...list[index], ...updates };
      }
      return { ...prev, [constraintKey]: list };
    });
    triggerDirtyState();
  };

  const triggerDirtyState = useCallback(() => {
    setIsDirty(true);
    setSnapshotName((prev) => {
      if (prev === "Constraints_Draft_1") {
        return `REF_DRAFT_${new Date().getTime().toString().slice(-4)}`;
      }
      if (prev && !prev.includes("_Refined") && !prev.startsWith("REF_DRAFT")) {
        return `${prev}_Refined`;
      }
      return prev;
    });
  }, []);

  const handleAddConstraint = (constraintKey: string, course: CourseOption) => {
    const group = CONSTRAINT_GROUPS.find((g) => g.key === constraintKey);
    if (!group) return;

    if (constraints[constraintKey]?.some((e) => e.courseCode === course.code)) {
      toast.warning(`${course.code} already added to this constraint`);
      return;
    }

    if (group.type === "none") {
      setConstraints((prev) => ({
        ...prev,
        [constraintKey]: [
          ...(prev[constraintKey] || []),
          { courseCode: course.code, venues: ["SELECTED"], periods: [] },
        ],
      }));
      triggerDirtyState();
      toast.success(`${course.code} added added to ${group.label}`);
      setAddingToGroup(null);
      return;
    }

    setPendingChip({ constraintKey, course });
    // Auto-open selector based on constraint type
    setActiveSelector({
      type: group.type,
      constraintKey,
      category: group.category,
      entryIndex: null, // Critical: Ensure it's null for new additions
      isCollective: group.isCollective,
    });
    setAddingToGroup(null);
  };

  const handleOpenCollectivePicker = (group: ConstraintGroup) => {
    setActiveSelector({
      type: group.type,
      constraintKey: group.key,
      category: group.category,
      entryIndex: null,
      isCollective: true,
    });
    setPendingChip({
      constraintKey: group.key,
      course: { code: "GROUP", title: "Constraint Group" },
    });
    setAddingToGroup(null);
  };

  const handlePeriodSelect = (periods: number[]) => {
    if (!activeSelector) return;
    const conflictingPeriods = periods.filter((p) =>
      excludedPeriods.includes(p),
    );
    if (conflictingPeriods.length > 0) {
      toast.error(
        `Conflict: Period(s) ${conflictingPeriods.join(", ")} are mathematically excluded.`,
      );
      return;
    }

    if (pendingChip) {
      setPendingValues(periods);
      setConfirmModal({
        isOpen: true,
        action: "add",
        constraintKey: activeSelector.constraintKey,
        details: `Add ${pendingChip.course.code} with periods ${periods.join(", ")}?`,
      });
    } else if (activeSelector.entryIndex !== null) {
      updateConstraint(
        activeSelector.constraintKey,
        activeSelector.entryIndex,
        { periods },
      );
    }
    setActiveSelector(null);
  };

  const handleVenueSelect = (venues: string[]) => {
    if (!activeSelector) return;
    if (pendingChip) {
      setPendingValues(venues);
      setConfirmModal({
        isOpen: true,
        action: "add",
        constraintKey: activeSelector.constraintKey,
        details: `Add ${pendingChip.course.code} with selections: ${venues.join(", ")}?`,
      });
    } else if (activeSelector.entryIndex !== null) {
      updateConstraint(
        activeSelector.constraintKey,
        activeSelector.entryIndex,
        { venues },
      );
    }
    setActiveSelector(null);
  };

  const confirmAddEntry = useCallback(() => {
    if (!pendingChip) return;
    const { constraintKey } = pendingChip;
    const isCollective = CONSTRAINT_GROUPS.find(
      (g) => g.key === constraintKey,
    )?.isCollective;

    const newEntry: ConstraintEntry = {
      courseCode: isCollective
        ? (pendingValues as string[])[0]
        : pendingChip.course.code,
      periods:
        Array.isArray(pendingValues) && typeof pendingValues[0] === "number"
          ? (pendingValues as number[])
          : [],
      venues:
        Array.isArray(pendingValues) && typeof pendingValues[0] === "string"
          ? (pendingValues as string[])
          : [],
    };

    // If collective, the venues list contains ALL courses, and courseCode is just the first one
    if (isCollective && Array.isArray(pendingValues)) {
      newEntry.venues = pendingValues as string[];
      newEntry.courseCode = (pendingValues as string[])[0] || "GROUP";
    }

    setConstraints((prev) => ({
      ...prev,
      [constraintKey]: [...(prev[constraintKey] || []), newEntry],
    }));
    triggerDirtyState();
    toast.success(
      `${isCollective ? "Constraint" : pendingChip.course.code} added`,
    );
    setPendingChip(null);
    setPendingValues(null);
    setConfirmModal({ isOpen: false, action: "add" });
  }, [pendingChip, pendingValues]);

  const handleRemoveEntry = (constraintKey: string, index: number) => {
    const entry = constraints[constraintKey]?.[index];
    setConfirmModal({
      isOpen: true,
      action: "remove",
      constraintKey,
      entryIndex: index,
      details: `Remove ${entry?.courseCode}?`,
    });
  };

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
    triggerDirtyState();
    toast.success("Constraint removed");
    setConfirmModal({ isOpen: false, action: "add" });
  }, [confirmModal]);

  const confirmSaveAll = useCallback(async () => {
    if (!onSaveAll) return;
    setIsSaving(true);
    try {
      const dbConstraints: any = {};
      Object.entries(constraints).forEach(([key, entries]) => {
        if (entries.length > 0) {
          dbConstraints[key] = entries
            .map((entry) => {
              const group = CONSTRAINT_GROUPS.find((g) => g.key === key);
              if (group?.type === "none") return entry.courseCode;

              // In Section 8 mapping: keys are primary identifiers
              const items =
                group?.type === "period"
                  ? (entry.periods || []).join(",")
                  : (entry.venues || []).join(",");

              if (group?.isCollective) return `(${items})`;
              return `${entry.courseCode}(${items})`;
            })
            .join("; ");
        } else {
          dbConstraints[key] = "";
        }
      });
      dbConstraints.name =
        snapshotName || `Snapshot ${new Date().toLocaleString()}`;
      await onSaveAll(dbConstraints);
      setIsDirty(false);
      setConfirmModal({ isOpen: false, action: "add" });
      toast.success("Snapshot Archived Successfully");
    } catch {
      toast.error("Failed to archive snapshot");
    } finally {
      setIsSaving(false);
    }
  }, [onSaveAll, constraints, snapshotName]);

  const handleConfirmModalAction = () => {
    if (confirmModal.action === "add") confirmAddEntry();
    else if (confirmModal.action === "remove") confirmRemoveEntry();
    else if (confirmModal.action === "saveAll") confirmSaveAll();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
        <FiLock className="text-brick text-lg" />
        <h2 className="text-xs font-black uppercase tracking-widest text-brick">
          Institutional Constraints
        </h2>
        <div className="flex-1" />
        <button
          onClick={async () => {
            if (!onLoadHistory) return;
            setIsLoadingHistory(true);
            setShowHistory(true);
            try {
              const data = await onLoadHistory();
              setHistory(data);
            } catch {
              toast.error("Failed to load history");
            } finally {
              setIsLoadingHistory(false);
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-institutional-muted border border-brick/10 rounded hover:text-brick transition-all"
        >
          <FiRotateCcw className="text-[10px]" /> View History
        </button>
      </div>

      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-page rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-4 border border-brick/10"
            >
              <div className="flex justify-between items-center border-b border-brick/5 pb-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                  Snapshot Archive
                </h3>
                <button onClick={() => setShowHistory(false)}>
                  <FiX size={18} />
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {isLoadingHistory ? (
                  <p className="text-center py-10 italic">
                    Consulting ledgers...
                  </p>
                ) : (
                  history.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center p-4 bg-surface border border-brick/5 rounded hover:border-brick/20 transition-all"
                    >
                      <div>
                        <p className="text-xs font-bold text-institutional-primary">
                          {s.name}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const initialValues: Record<string, string> =
                            s as any;
                          const parsed: Record<string, ConstraintEntry[]> = {};
                          CONSTRAINT_GROUPS.forEach(
                            (g) => (parsed[g.key] = []),
                          );
                          Object.entries(initialValues).forEach(([k, v]) => {
                            if (v && parsed[k]) {
                              parsed[k] = v
                                .split(";")
                                .map((entry): ConstraintEntry | null => {
                                  const match = entry
                                    .trim()
                                    .match(/^([^(\s]+)(?:\((.*?)\))?$/);
                                  if (match) {
                                    const code = match[1];
                                    const items = (match[2] || "")
                                      .split(",")
                                      .filter(Boolean);
                                    const g = CONSTRAINT_GROUPS.find(
                                      (gr) => gr.key === k,
                                    );

                                    const entryObj: ConstraintEntry = {
                                      courseCode: code,
                                    };
                                    if (g?.type === "period") {
                                      entryObj.periods = items.map((i) =>
                                        parseInt(i, 10),
                                      );
                                    } else {
                                      entryObj.venues = items;
                                    }
                                    return entryObj;
                                  }
                                  return null;
                                })
                                .filter(
                                  (e): e is ConstraintEntry => e !== null,
                                );
                            }
                          });
                          setConstraints(parsed);
                          setSnapshotName(s.name);
                          setIsDirty(false);
                          setShowHistory(false);
                          toast.info("Snapshot loaded");
                        }}
                        className="px-4 py-2 bg-brick/10 text-brick text-[9px] font-black rounded hover:bg-brick hover:text-white transition-all"
                      >
                        Load
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-surface p-4 rounded-institutional border border-brick/10 mb-6 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
            Snapshot Identifier
          </label>
          <input
            type="text"
            disabled={!isDirty}
            placeholder="Enter snapshot name..."
            className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm outline-none disabled:opacity-50"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
          />
        </div>
        <button
          onClick={() =>
            setConfirmModal({
              isOpen: true,
              action: "saveAll",
              details: "Archive current constraints?",
            })
          }
          disabled={!isDirty || isSaving}
          className="px-6 py-3 bg-brick text-white rounded font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
        >
          Archive Snapshot
        </button>
      </div>

      <div className="flex gap-2 border-b border-brick/10 mb-6">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all ${activeTab === tab.id ? "text-brick border-b-2 border-brick" : "text-institutional-muted"}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONSTRAINT_GROUPS.filter((g) => g.category === activeTab).map(
          (group) => (
            <div
              key={group.key}
              className="bg-page/50 border border-brick/5 rounded p-4 flex flex-col"
            >
              <h3 className="text-sm font-black text-institutional-primary mb-1">
                {group.label}
              </h3>
              <p className="text-[10px] text-institutional-muted italic mb-4">
                {group.description}
              </p>
              <div className="flex-1 mb-4 max-h-[180px] overflow-y-auto flex flex-wrap gap-2 p-2 bg-surface rounded border border-brick/10">
                {constraints[group.key]?.map((entry, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setActiveSelector({
                        type: group.type,
                        constraintKey: group.key,
                        category: group.category,
                        entryIndex: idx,
                      })
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-brick/10 border border-brick/30 rounded-full text-[10px] font-bold text-brick cursor-pointer"
                  >
                    <span>
                      {group.isCollective ? "" : `${entry.courseCode}(`}
                      {group.type === "period"
                        ? (entry.periods || []).join(",")
                        : (entry.venues || []).join(",")}
                      {group.isCollective ? "" : ")"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEntry(group.key, idx);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(!constraints[group.key] ||
                  constraints[group.key].length === 0) && (
                  <p className="text-[10px] text-institutional-muted italic w-full text-center py-4">
                    No entries
                  </p>
                )}
              </div>
              {addingToGroup === group.key ? (
                group.isCollective ? (
                  <button
                    onClick={() => handleOpenCollectivePicker(group)}
                    className="w-full py-3 bg-brick/10 border border-brick border-dashed rounded text-[10px] font-black uppercase text-brick hover:bg-brick/20"
                  >
                    Open Course Registry
                  </button>
                ) : (
                  <InputChip
                    options={
                      group.category === "invigilator"
                        ? availableStaff
                        : group.key.includes("Venue") ||
                            group.key.startsWith("venue") ||
                            group.key.startsWith("periodIncV") ||
                            group.key.startsWith("periodExcV")
                          ? availableVenues.map((v) => ({
                              code: v.code,
                              title: v.name,
                            }))
                          : availableCourses
                    }
                    onSelect={(item) => handleAddConstraint(group.key, item)}
                  />
                )
              ) : (
                <button
                  onClick={() => setAddingToGroup(group.key)}
                  className="py-2 border border-dashed border-brick/30 rounded text-[10px] font-black uppercase text-brick hover:bg-brick/5"
                >
                  + Add{" "}
                  {group.category === "venue" ||
                  group.key.startsWith("periodIncV") ||
                  group.key.startsWith("periodExcV")
                    ? "Venue"
                    : group.category === "invigilator"
                      ? "Staff"
                      : "Course"}
                </button>
              )}
            </div>
          ),
        )}
      </div>

      <PeriodSlotSelector
        isOpen={activeSelector?.type === "period"}
        onClose={() => setActiveSelector(null)}
        onConfirm={handlePeriodSelect}
        maxPeriods={maxPeriods}
        periodMapping={periodMapping}
        excludedPeriods={excludedPeriods}
        initialSelected={
          activeSelector && activeSelector.entryIndex !== null
            ? constraints[activeSelector.constraintKey]?.[
                activeSelector.entryIndex
              ]?.periods
            : []
        }
      />
      <RegistryPicker
        isOpen={activeSelector?.type === "venue"}
        onClose={() => setActiveSelector(null)}
        onConfirm={handleVenueSelect}
        title={
          activeSelector?.isCollective
            ? "Register Collective Group"
            : activeSelector?.constraintKey.includes("Venue") ||
                activeSelector?.constraintKey.startsWith("venue")
              ? "Select Courses"
              : "Select Target"
        }
        placeholder="Filter list..."
        availableVenues={
          activeSelector?.constraintKey.includes("Venue") ||
          activeSelector?.constraintKey.startsWith("venue") ||
          activeSelector?.category === "advanced"
            ? availableCourses.map((c) => ({ code: c.code, name: c.title }))
            : availableVenues
        }
        initialSelected={
          activeSelector && activeSelector.entryIndex !== null
            ? constraints[activeSelector.constraintKey]?.[
                activeSelector.entryIndex
              ]?.venues
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
              : "Archive Snapshot"
        }
        message={confirmModal.details || ""}
        onConfirm={handleConfirmModalAction}
        onCancel={() => setConfirmModal({ isOpen: false, action: "add" })}
        isDangerous={confirmModal.action === "remove"}
      />
    </div>
  );
};

export default InstitutionalConstraintsSection;
// Institutional Constraints Orchestrator v1.1
