import { apiClient } from "./apiClient";
import { Registration } from "../../types/institutional";

/**
 * Institutional Registration Service (Course Registration)
 * Features: Type-safe interactions for course registration.
 */
export const registrationService = {
  getAll: async (): Promise<Registration[]> => {
    // Note: Backend endpoint is /registration/get
    const response = await apiClient.get("/registration/get");
    return response as Registration[];
  },

  create: async (data: Partial<Registration>): Promise<void> => {
    // Backend expects Registration object
    // Mapped from backend controller: @PostMapping("/post")
    const payload = {
      student: data.studentId ? { id: data.studentId } : undefined,
      course: data.courseId ? { id: data.courseId } : undefined,
      session: data.session,
      semester: data.semester,
    };
    await apiClient.post("/registration/post", payload);
  },

  update: async (
    id: number,
    data: Partial<Registration>,
  ): Promise<Registration> => {
    const payload = {
      student: data.studentId ? { id: data.studentId } : undefined,
      course: data.courseId ? { id: data.courseId } : undefined,
      session: data.session,
      semester: data.semester,
    };
    const response = await apiClient.put(`/registration/update/${id}`, payload);
    return response as Registration;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/registration/delete/${id}`);
  },
};
