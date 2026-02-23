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

  getById: async (id: string | number): Promise<Student> => {
    const all = await studentService.getAll();
    const found = all.find((s) => s.id.toString() === id.toString());
    if (!found) throw new Error("Student not found");
    return found;
  },

  create: async (studentData: Partial<Student>): Promise<Student> => {
    // Mapping back to the @RequestBody expectations of the backend (fullName, programme, cenID)
    const payload = {
      matricNo: studentData.matricNo,
      fullName: studentData.fullName,
      programme: studentData.programme,
      level: studentData.level,
      department: studentData.departmentId
        ? { id: studentData.departmentId }
        : null,
      college: studentData.collegeId ? { id: studentData.collegeId } : null,
    };
    const response = await apiClient.post("/student/post", payload);
    return response as Student;
  },

  update: async (
    id: string | number,
    studentData: Partial<Student>,
  ): Promise<Student> => {
    const payload = {
      matricNo: studentData.matricNo,
      fullName: studentData.fullName,
      programme: studentData.programme,
      level: studentData.level,
      department: studentData.departmentId
        ? { id: studentData.departmentId }
        : undefined,
      college: studentData.collegeId
        ? { id: studentData.collegeId }
        : undefined,
    };
    const response = await apiClient.put(`/student/update/${id}`, payload);
    return response as Student;
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/student/delete/${id}`);
  },
};
