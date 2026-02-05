import { create } from "zustand";
import { timetableService } from "../api/timetableService";
import { TimetableSlot } from "../../types/institutional";

interface Timetable {
  id: string;
  name: string;
  slots: TimetableSlot[];
  status: "DRAFT" | "FINALIZED";
  academicSession: string;
  semester: number;
}

interface TimetableStore {
  timetables: Timetable[];
  currentTimetable: Timetable | null;
  isLoading: boolean;
  error: string | null;
  fetchTimetables: () => Promise<void>;
  generateTimetable: (settings: any) => Promise<Timetable>;
  setCurrentTimetable: (timetable: Timetable | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Institutional Timetable Store
 * Features: Type-safe orchestration of complex scheduling state.
 */
export const useTimetableStore = create<TimetableStore>((set) => ({
  timetables: [],
  currentTimetable: null,
  isLoading: false,
  error: null,

  fetchTimetables: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await timetableService.getAll();
      set({ timetables: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  generateTimetable: async (settings: any) => {
    set({ isLoading: true, error: null });
    try {
      const newTimetable = await timetableService.generate(settings);
      set((state) => ({
        timetables: [...state.timetables, newTimetable],
        currentTimetable: newTimetable,
        isLoading: false,
      }));
      return newTimetable;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setCurrentTimetable: (timetable) => set({ currentTimetable: timetable }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
