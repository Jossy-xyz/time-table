import { create } from "zustand";
import { courseService } from "../api/courseService";
import { Course } from "../../types/institutional";

interface CourseStore {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  addCourse: (courseData: Partial<Course>) => Promise<Course>;
  updateCourse: (id: number, courseData: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Institutional Course Store
 * Enforces strict typing for academic curriculum state.
 */
export const useCourseStore = create<CourseStore>((set) => ({
  courses: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await courseService.getAll();
      set({ courses: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addCourse: async (courseData: Partial<Course>) => {
    set({ isLoading: true, error: null });
    try {
      const newCourse = await courseService.create(courseData);
      set((state) => ({
        courses: [...state.courses, newCourse],
        isLoading: false,
      }));
      return newCourse;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateCourse: async (id: number, courseData: Partial<Course>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await courseService.update(id, courseData);
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? updated : c)),
        isLoading: false,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteCourse: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await courseService.delete(id);
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
