import { apiClient } from "./apiClient";
import { Constraint } from "../../types/institutional";

/**
 * Institutional Constraint Service
 * Features: Type-safe interactions for scheduling constraints.
 */
export const constraintService = {
  add: async (name: string, type: string, details: string): Promise<void> => {
    // Backend endpoint: /constraint/add
    await apiClient.post("/constraint/add", { name, type, details });
  },

  saveAll: async (data: Partial<Constraint>): Promise<void> => {
    // Backend endpoint: /constraint/add (which handles snapshotted/named saves)
    await apiClient.post("/constraint/add", data);
  },

  getHistory: async (): Promise<Constraint[]> => {
    const response = await apiClient.get("/constraint/history");
    return response;
  },

  getLatest: async (): Promise<Constraint | null> => {
    try {
      const response = await apiClient.get("/constraint/get/latest");
      return response;
    } catch (error) {
      console.error("Failed to fetch latest constraints", error);
      return null;
    }
  },
};
