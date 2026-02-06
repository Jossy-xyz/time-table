import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GeneralSettings } from "../../types/institutional";

/**
 * Institutional Configuration Store (The Triple-Lock Pointer)
 * Manages the active snapshots for General Settings, Constraints, and Exclusions.
 * Ensures the entire application reacts to topology changes (Periods x Days).
 */

interface Topology {
  daysPerWeek: number;
  periodsPerDay: number;
  examWeeks: number;
}

interface InstitutionalStore {
  // Active Record Pointers (IDs)
  selectedGsId: number | null;
  selectedConstraintId: number | null;
  selectedExclusionId: number | null;

  // Reactive Engine Topology
  topology: Topology;

  // Active Payload Metadata
  activeGS: Partial<GeneralSettings> | null;

  // Actions
  setActiveGs: (gs: Partial<GeneralSettings>) => void;
  setConstraintId: (id: number | null) => void;
  setExclusionId: (id: number | null) => void;

  // Reset context (e.g., on session change)
  resetContext: () => void;
}

export const useInstitutionalStore = create<InstitutionalStore>()(
  persist(
    (set) => ({
      selectedGsId: null,
      selectedConstraintId: null,
      selectedExclusionId: null,

      topology: {
        daysPerWeek: 5,
        periodsPerDay: 3,
        examWeeks: 2,
      },

      activeGS: null,

      setActiveGs: (gs: Partial<GeneralSettings>) => {
        set((state) => ({
          selectedGsId: gs.id || state.selectedGsId,
          activeGS: gs,
          topology: {
            daysPerWeek: gs.daysPerWeek ?? state.topology.daysPerWeek,
            periodsPerDay: gs.periodsPerDay ?? state.topology.periodsPerDay,
            examWeeks: gs.examWeeks ?? state.topology.examWeeks,
          },
        }));
      },

      setConstraintId: (id: number | null) => {
        set({ selectedConstraintId: id });
      },

      setExclusionId: (id: number | null) => {
        set({ selectedExclusionId: id });
      },

      resetContext: () => {
        set({
          selectedGsId: null,
          selectedConstraintId: null,
          selectedExclusionId: null,
          activeGS: null,
        });
      },
    }),
    {
      name: "institutional-context", // Persistence key
    },
  ),
);
