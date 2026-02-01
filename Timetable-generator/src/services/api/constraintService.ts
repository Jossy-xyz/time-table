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
    // Backend endpoint: /constraint/save-all
    // Logic from SettingsPage: prepares constraintData object
    // Assuming the backend expects the exact object structure sent in SettingsPage
    await apiClient.post("/constraint/save-all", data);
  },

  getLatest: async (): Promise<Constraint | null> => {
    try {
      const response = await apiClient.get("/constraint/get/latest");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch latest constraints", error);
      return null;
    }
  },
};
