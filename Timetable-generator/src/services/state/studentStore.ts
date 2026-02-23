import { create } from "zustand";
import { studentService } from "../api/studentService";
import { Student } from "../../types/institutional";

interface StudentStore {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  addStudent: (studentData: Partial<Student>) => Promise<Student>;
  updateStudent: (
    id: string | number,
    studentData: Partial<Student>,
  ) => Promise<Student>;
  deleteStudent: (id: string | number) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Institutional Student Store
 * Enforces strict typing for student data state.
 */
export const useStudentStore = create<StudentStore>((set) => ({
  students: [],
  isLoading: false,
  error: null,

  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await studentService.getAll();
      set({ students: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addStudent: async (studentData: Partial<Student>) => {
    set({ isLoading: true, error: null });
    try {
      const newStudent = await studentService.create(studentData);
      set((state) => ({
        students: [...state.students, newStudent],
        isLoading: false,
      }));
      return newStudent;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateStudent: async (id: string | number, studentData: Partial<Student>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await studentService.update(id, studentData);
      set((state) => ({
        students: state.students.map((s) =>
          String(s.id) === String(id) ? updated : s,
        ),
        isLoading: false,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteStudent: async (id: string | number) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.delete(id);
      set((state) => ({
        students: state.students.filter((s) => String(s.id) !== String(id)),
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
