import React, { useState, useEffect, useMemo } from "react";
import { periodExclusionService } from "../../services/api";
import { useAuthStore } from "../../services/state/authStore";
import { toast } from "react-toastify";
import {
  PeriodMapping,
  PeriodMappingResponse,
  PeriodExclusionDto,
} from "../../types/institutional";
import { PeriodButton } from "./PeriodButton";
import "./CalendarPeriodSelector.css";
import { useInstitutionalStore } from "../../services/state/institutionalStore";

import { FiRotateCcw, FiX, FiDatabase } from "react-icons/fi";
import ConfirmModal from "../molecules/ConfirmModal";

interface CalendarGridProps {
  onSave?: () => void;
  settingsId?: number;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  onSave,
  settingsId,
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.roleCode === "AD" || user?.roleId === 1;
  const { setExclusionId, topology } = useInstitutionalStore();

  // TODO: Enforce RBAC - implement full permission checks for CR, ST, DR here later

  const [mapping, setMapping] = useState<PeriodMappingResponse | null>(null);
  const [excludedIndices, setExcludedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [generalSettingsId, setGeneralSettingsId] = useState<number | null>(
    null,
  );
  const [history, setHistory] = useState<PeriodExclusionDto[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(
    null,
  );
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);

  // Modal State for custom confirm
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    loadData();
    loadHistory();
  }, [settingsId, topology.periodsPerDay, topology.daysPerWeek]);

  const loadData = async () => {
    setLoading(true);
    try {
      const mapData = await periodExclusionService.getMapping(settingsId);
      setMapping(mapData);

      // Identify system-locked periods from the mapping
      const systemLockedIndices = mapData.periods
        .filter((p) => p.isSystemLocked)
        .map((p) => p.periodIndex);

      const activeData =
        await periodExclusionService.getActiveExclusions(settingsId);
      if (activeData) {
        // Merge saved exclusions with current system-locked indices
        const mergedExclusions = new Set([
          ...activeData.excludedPeriods,
          ...systemLockedIndices,
        ]);
        setExcludedIndices(mergedExclusions);
        setSnapshotName(activeData.name);
        setGeneralSettingsId(activeData.generalSettingsId);
        setSelectedSnapshotId(activeData.id);
      } else {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 5);
        setSnapshotName(`Exclusion Snapshot ${dateStr} ${timeStr}`);
        // Seed exclusions with system-locked indices for new snapshots
        setExcludedIndices(new Set(systemLockedIndices));
      }
    } catch (error) {
      console.error("Failed to load period data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await periodExclusionService.getHistory(settingsId);
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const handleToggle = (periodIndex: number) => {
    if (!isAdmin) return;

    // Prevent toggling if the period is system-locked
    const p = mapping?.periods.find((item) => item.periodIndex === periodIndex);
    if (p?.isSystemLocked) return;

    setExcludedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(periodIndex)) {
        next.delete(periodIndex);
      } else {
        next.add(periodIndex);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      await periodExclusionService.saveExclusions(
        {
          name: snapshotName || "Untitled Snapshot",
          excludedPeriods: Array.from(excludedIndices),
          setAsActive: true,
        },
        settingsId,
      );
      if (onSave) onSave();
      loadHistory();

      // Sync the new exclusion ID to the global store
      const activeData =
        await periodExclusionService.getActiveExclusions(settingsId);
      if (activeData) setExclusionId(activeData.id);

      toast.success("Institutional snapshot archived successfully!");
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to archive exclusions.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (snapshot: PeriodExclusionDto) => {
    if (!isAdmin) return;
    setConfirmState({
      isOpen: true,
      title: "Restore Snapshot",
      message: `Are you sure you want to restore the configuration "${snapshot.name}"? This will overwrite the current matrix buffer.`,
      onConfirm: async () => {
        try {
          await periodExclusionService.activateSnapshot(snapshot.id);
          setExcludedIndices(new Set(snapshot.excludedPeriods));
          setSnapshotName(snapshot.name);
          setSelectedSnapshotId(snapshot.id);
          setExclusionId(snapshot.id); // Sync to global store
          setIsRegistryOpen(false); // Close modal on restore
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          toast.success(
            "Version restored successfully from institutional archives.",
          );
        } catch (error) {
          toast.error("Failed to restore version.");
        }
      },
    });
  };

  const handleClearAll = () => {
    if (!isAdmin) return;
    setConfirmState({
      isOpen: true,
      title: "Purge Matrix",
      message:
        "Are you sure you want to purge all manual exclusions from the current buffer? System-locked periods will remain excluded.",
      onConfirm: () => {
        // Keep only system-locked indices
        const systemLockedIndices = mapping?.periods
          .filter((p) => p.isSystemLocked)
          .map((p) => p.periodIndex);
        setExcludedIndices(new Set(systemLockedIndices || []));
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        toast.info("Buffer purged (System locks preserved).");
      },
    });
  };

  const handleSelectAll = () => {
    if (!isAdmin) return;
    if (!mapping) return;
    setConfirmState({
      isOpen: true,
      title: "Exclude All Slots",
      message:
        "Are you sure you want to exclude ALL temporal slots in the current cycle? This will block all periods from scheduling.",
      onConfirm: () => {
        const allIndices = mapping.periods.map((p) => p.periodIndex);
        setExcludedIndices(new Set(allIndices));
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        toast.info("All slots excluded.");
      },
    });
  };

  // Group periods by week and then by day within week (Locked to 7-day Mon-Sun structure)
  const groupedData = useMemo(() => {
    if (!mapping || !mapping.periods) return null;

    const weeks: Record<number, PeriodMapping[]> = {};
    mapping.periods.forEach((p) => {
      if (!weeks[p.weekNumber]) weeks[p.weekNumber] = [];
      weeks[p.weekNumber].push(p);
    });

    return Object.entries(weeks).map(([weekNum, periods]) => {
      // Find all distinct slots (periods per day) across this week
      const distinctPeriodOfDays = Array.from(
        new Set(periods.map((p) => p.periodOfDay)),
      ).sort((a, b) => a - b);

      // Create a 7-day date map for the header (Monday to Sunday)
      // We look at the date objects to determine their weekday index
      const weekdayDateMap: (string | null)[] = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      periods.forEach((p) => {
        const d = new Date(p.date);
        let dayIdx = d.getDay(); // 0 is Sunday, 1-6 is Mon-Sat
        // Map to 0-6 where 0 is Monday, 6 is Sunday
        const adjustedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        weekdayDateMap[adjustedIdx] = p.date;
      });

      return {
        weekNumber: parseInt(weekNum),
        weekdayDates: weekdayDateMap,
        periodsByDayAndSlot: distinctPeriodOfDays.map((slot) => ({
          slot,
          cols: [0, 1, 2, 3, 4, 5, 6].map((dayIdx) =>
            periods.find((p) => {
              const pd = new Date(p.date);
              let pIdx = pd.getDay();
              const adjustedPIdx = pIdx === 0 ? 6 : pIdx - 1;
              return adjustedPIdx === dayIdx && p.periodOfDay === slot;
            }),
          ),
        })),
      };
    });
  }, [mapping]);

  if (loading)
    return (
      <div className="p-8 text-center font-bold text-brick italic">
        Synchronizing Institutional Grid...
      </div>
    );
  if (!mapping || !groupedData)
    return (
      <div className="p-8 bg-brick/5 rounded-lg text-center border border-brick/10">
        <h3 className="text-brick font-black mb-2">GRID TOPOLOGY UNDEFINED</h3>
        <p className="text-sm opacity-60">
          Configure General Settings to initialize the calendar manifest.
        </p>
      </div>
    );

  const formatDate = (d: Date | string, opts: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof d === "string" ? new Date(d) : d;
    return dateObj.toLocaleDateString("en-GB", opts);
  };

  if (!isAdmin) {
    return (
      <div className="p-12 bg-brick/5 rounded-institutional border-2 border-dashed border-brick/10 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 bg-brick/10 rounded-full flex items-center justify-center mb-2">
          <FiDatabase className="text-brick text-2xl" />
        </div>
        <div>
          <h3 className="text-brick font-black uppercase tracking-widest text-sm">
            Temporal Matrix Locked
          </h3>
          <p className="text-[10px] text-institutional-muted font-bold max-w-xs mx-auto uppercase tracking-tighter">
            View Timetable Coming Soon • Institutional Access Restricted
          </p>
        </div>
        <div className="pt-4 border-t border-brick/5 w-full flex justify-center">
          <span className="text-[8px] font-black bg-brick/10 text-brick px-3 py-1 rounded-full uppercase tracking-[0.2em] italic">
            Awaiting Final Orchestration
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="main-exclusion-wrapper">
      <div className="calendar-grid-container">
        <div className="calendar-header">
          <div>
            <h3 className="text-lg font-black tracking-tight text-brick">
              Temporal Matrix
            </h3>
            <p className="text-[10px] font-bold opacity-50 uppercase">
              Cycle:{" "}
              {formatDate(mapping.startDate, {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {formatDate(mapping.endDate, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <label className="text-[9px] font-black uppercase text-brick/30">
                Registry Key
              </label>
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                className="snapshot-name-input !w-48 !py-1 !px-2 !text-xs"
                placeholder="Label this snapshot..."
                disabled={!isAdmin}
              />
            </div>
            <button
              onClick={() => setIsRegistryOpen(true)}
              className="history-button"
              title="Open Snapshot Registry"
              disabled={!isAdmin && history.length === 0}
            >
              <FiRotateCcw size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-6 institutional-scroll">
          {groupedData.map((week) => (
            <div key={week.weekNumber} className="week-container">
              {/* Simplified Week Badge */}
              <div className="mb-1 bg-brick/5 w-fit px-3 py-1 rounded-full border border-brick/10">
                <span className="text-[10px] font-black text-brick-deep uppercase tracking-widest">
                  WEEK {week.weekNumber}
                </span>
              </div>

              <div className="week-label-row">
                {week.weekdayDates.map((day, idx) => (
                  <div key={idx} className="week-header-cell">
                    {day
                      ? formatDate(day, { weekday: "short", day: "numeric" })
                      : "-"}
                  </div>
                ))}
              </div>

              {week.periodsByDayAndSlot.map((row) => (
                <div key={row.slot} className="period-row">
                  {row.cols.map((p, idx) => (
                    <div key={idx} className="relative">
                      {p ? (
                        <PeriodButton
                          displayNumber={p.displayIndex}
                          label={`P${p.periodOfDay}`}
                          date={p.date}
                          periodOfDay={p.periodOfDay}
                          isExcluded={excludedIndices.has(p.periodIndex)}
                          isSystemLocked={p.isSystemLocked}
                          onToggle={() => handleToggle(p.periodIndex)}
                          disabled={!isAdmin}
                        />
                      ) : (
                        <div className="h-[38px] bg-brick/5 border border-dashed border-brick/10 rounded-sm opacity-10" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="selection-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-icon-red">●</span>
              <span className="text-brick-3">
                {excludedIndices.size} Excluded Slots
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-icon-green">●</span>
              <span className="text-muted">
                {mapping.totalPeriods - excludedIndices.size} Available
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClearAll}
              disabled={!isAdmin}
              className="btn-secondary px-4 py-2 rounded font-bold text-xs uppercase border border-brick/10 hover:bg-brick/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Buffer
            </button>
            <button
              onClick={handleSelectAll}
              disabled={!isAdmin}
              className="btn-secondary px-4 py-2 rounded font-bold text-xs uppercase border border-brick/10 hover:bg-brick/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exclude All
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isAdmin}
              className="brand-button-gold text-xs px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Archiving..." : "Archive Snapshot"}
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Registry Modal */}
      {isRegistryOpen && (
        <div
          className="registry-modal-overlay"
          onClick={() => setIsRegistryOpen(false)}
        >
          <div
            className="registry-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <FiRotateCcw className="text-brick" />
                <div>
                  <h3 className="text-brick font-black uppercase text-xs tracking-widest">
                    Snapshot Registry
                  </h3>
                  <p className="text-[9px] text-muted font-bold">
                    Historical Configuration Log
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsRegistryOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="registry-body">
              <div className="grid gap-3">
                {history.length === 0 ? (
                  <div className="p-8 text-center text-muted italic">
                    <p className="text-sm">No historical snapshots recorded.</p>
                    <p className="text-[10px]">
                      Archived configurations will appear here.
                    </p>
                  </div>
                ) : (
                  history.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className={`history-item ${selectedSnapshotId === snapshot.id ? "active" : ""}`}
                      onClick={() => handleRestore(snapshot)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-brick text-xs uppercase">
                          {snapshot.name}
                        </h4>
                        {snapshot.isActive && (
                          <span className="text-[8px] font-black bg-brick/10 text-brick px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted font-bold">
                        <span>
                          {snapshot.excludedPeriods.length} Excluded Slots
                        </span>
                        <span className="opacity-60 italic">
                          {new Date(snapshot.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-gold-1/5 border-t border-brick/5">
              <p className="text-[9px] leading-relaxed text-brick-3 font-medium text-center">
                Select a configuration to restore it to the active matrix.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirmation Sentinel */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        confirmText="Proceed"
        isDangerous={
          confirmState.title.includes("Purge") ||
          confirmState.title.includes("Exclude")
        }
        icon="alert"
      />
    </div>
  );
};
