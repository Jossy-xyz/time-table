import { apiClient } from "./apiClient";
import { Centre } from "../../types/institutional";

export type College = Centre;

export const collegeService = {
  getAll: async (): Promise<Centre[]> => {
    const response = await apiClient.get("/college/get");
    return response as Centre[];
  },

  getById: async (id: number): Promise<Centre | null> => {
    try {
      const colleges = await collegeService.getAll();
      return colleges.find((c) => c.id === id) || null;
    } catch (error) {
      return null;
    }
  },

  create: async (collegeData: Partial<Centre>): Promise<void> => {
    await apiClient.post("/college/post", collegeData);
  },
};
