import { apiClient } from "./apiClient";
import { Course } from "../../types/institutional";

/**
 * Institutional Course Service
 * Standardized with Backend DTOs and Scoping headers.
 */
export const courseService = {
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get("/course/get");
    return response as Course[];
  },

  getById: async (id: number): Promise<Course> => {
    const all = await courseService.getAll();
    const found = all.find((c) => c.id === id);
    if (!found) throw new Error("Course not found");
    return found;
  },

  create: async (courseData: Partial<Course>): Promise<Course> => {
    const payload = {
      code: courseData.code,
      title: courseData.title,
      unit: courseData.unit,
      semester: courseData.semester,
      examType: courseData.examType,
      department: { id: courseData.departmentId },
    };
    const response = await apiClient.post("/course/done", payload);
    return response as Course;
  },

  update: async (id: number, courseData: Partial<Course>): Promise<Course> => {
    const payload = {
      code: courseData.code,
      title: courseData.title,
      unit: courseData.unit,
      semester: courseData.semester,
      examType: courseData.examType,
      department: courseData.departmentId
        ? { id: courseData.departmentId }
        : undefined,
    };
    const response = await apiClient.put(`/course/update/${id}`, payload);
    return response as Course;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/course/delete/${id}`);
  },
};
