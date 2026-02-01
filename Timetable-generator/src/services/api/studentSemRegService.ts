import { apiClient } from "./apiClient";
import { StudentSemesterRegistration } from "../../types/institutional";

/**
 * Institutional Student Semester Registration Service
 * Features: Type-safe interactions for semester registration (bulk course enrollment).
 */
export const studentSemRegService = {
  getAll: async (): Promise<StudentSemesterRegistration[]> => {
    // Backend endpoint: /sem/get
    const response = await apiClient.get("/sem/get");
    return response as StudentSemesterRegistration[];
  },

  create: async (data: Partial<StudentSemesterRegistration>): Promise<void> => {
    // Backend endpoint: /sem/reg
    const payload = {
      matric_NO: data.matric_NO,
      course_Code_List: data.course_Code_List,
      session: data.session,
      semester: data.semester,
    };
    await apiClient.post("/sem/reg", payload);
  },

  update: async (
    id: number,
    data: Partial<StudentSemesterRegistration>,
  ): Promise<StudentSemesterRegistration> => {
    // Backend endpoint: /sem/update/{id}
    const payload = {
      matric_NO: data.matric_NO,
      course_Code_List: data.course_Code_List,
      session: data.session,
      semester: data.semester,
    };
    const response = await apiClient.put(`/sem/update/${id}`, payload);
    return response as StudentSemesterRegistration;
  },

  delete: async (id: number): Promise<void> => {
    // Backend endpoint: /sem/delete/{id}
    await apiClient.delete(`/sem/delete/${id}`);
  },
};
