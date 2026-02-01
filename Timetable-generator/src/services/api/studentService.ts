import { apiClient } from "./apiClient";
import { Student } from "../../types/institutional";

/**
 * Institutional Student Service
 * Features: Type-safe academic registry interactions synchronized with Backend DTOs.
 */
export const studentService = {
  getAll: async (): Promise<Student[]> => {
    const response = await apiClient.get("/student/get");
    return response as Student[];
  },

  getById: async (id: number): Promise<Student> => {
    // Note: If backend doesn't have a direct getById, we might need one or filter.
    // For now, assume listing or a specific endpoint exists.
    const all = await studentService.getAll();
    const found = all.find((s) => s.id === id);
    if (!found) throw new Error("Student not found");
    return found;
  },

  create: async (studentData: Partial<Student>): Promise<Student> => {
    // Mapping back to the @RequestBody expectations of the backend
    const payload = {
      matricNo: studentData.matricNo,
      surname: studentData.surname,
      firstname: studentData.firstname,
      middlename: studentData.middlename,
      gender: studentData.gender,
      level: studentData.level,
      department: { id: studentData.departmentId },
      program: { id: studentData.programId },
    };
    const response = await apiClient.post("/student/post", payload);
    return response as Student;
  },

  update: async (
    id: number,
    studentData: Partial<Student>,
  ): Promise<Student> => {
    const payload = {
      matricNo: studentData.matricNo,
      surname: studentData.surname,
      firstname: studentData.firstname,
      middlename: studentData.middlename,
      gender: studentData.gender,
      level: studentData.level,
      // Pass IDs for relationships
      department: studentData.departmentId
        ? { id: studentData.departmentId }
        : undefined,
      program: studentData.programId
        ? { id: studentData.programId }
        : undefined,
    };
    const response = await apiClient.put(`/student/update/${id}`, payload);
    return response as Student;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/student/delete/${id}`);
  },
};
