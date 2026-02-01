import { apiClient } from "./apiClient";

export interface SlashedCourse {
  id: number;
  code: string;
  type: string;
  sem: string | number;
}

/**
 * Institutional Slashed Course Service
 * Features: Type-safe interactions for slashed course registry.
 * Note: Backend implementation for this service is currently pending/unverified.
 */
export const slashedCourseService = {
  getAll: async (): Promise<SlashedCourse[]> => {
    const response = await apiClient.get("/slashed/get");
    return response as SlashedCourse[];
  },

  create: async (data: Partial<SlashedCourse>): Promise<void> => {
    const payload = {
      code: data.code,
      type: data.type,
      sem: data.sem,
    };
    await apiClient.post("/slashed/post", payload);
  },

  update: async (
    id: number,
    data: Partial<SlashedCourse>,
  ): Promise<SlashedCourse> => {
    const payload = {
      code: data.code,
      type: data.type,
      sem: data.sem,
    };
    const response = await apiClient.put(`/slashed/update/${id}`, payload);
    return response as SlashedCourse;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/slashed/delete/${id}`);
  },
};
