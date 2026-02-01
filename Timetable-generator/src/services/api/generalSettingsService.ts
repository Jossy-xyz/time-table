import { apiClient } from "./apiClient";
import { GeneralSettings } from "../../types/institutional";

/**
 * General Settings Service
 * Manages global schedule orchestration configuration (days, periods, session).
 */
export const generalSettingsService = {
  get: async (): Promise<GeneralSettings> => {
    const response = await apiClient.get("/settings/general");
    return response as GeneralSettings;
  },

  update: async (
    settings: Partial<GeneralSettings>,
  ): Promise<GeneralSettings> => {
    const response = await apiClient.post("/settings/general", settings);
    return response as GeneralSettings;
  },
};
