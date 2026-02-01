import { apiClient } from "./apiClient";
import {
  PeriodMappingResponse,
  PeriodExclusionDto,
  PeriodExclusionRequest,
} from "../../types/institutional";

const BASE = "/api/periods";

export const periodExclusionService = {
  /**
   * Fetch the calculated period grid based on current General Settings.
   */
  getMapping: async (settingsId?: number): Promise<PeriodMappingResponse> => {
    const url = settingsId
      ? `${BASE}/mapping?settingsId=${settingsId}`
      : `${BASE}/mapping`;
    return apiClient.get(url);
  },

  /**
   * Get the currently active period exclusion snapshot.
   */
  getActiveExclusions: async (
    settingsId?: number,
  ): Promise<PeriodExclusionDto | null> => {
    const url = settingsId
      ? `${BASE}/exclusions/active?settingsId=${settingsId}`
      : `${BASE}/exclusions/active`;
    return apiClient.get(url);
  },

  /**
   * Save a new period exclusion snapshot.
   */
  saveExclusions: async (
    data: PeriodExclusionRequest,
    settingsId?: number,
  ): Promise<{ id: number; message?: string }> => {
    const url = settingsId
      ? `${BASE}/exclusions?settingsId=${settingsId}`
      : `${BASE}/exclusions`;
    return apiClient.post(url, data);
  },

  /**
   * Get history of all snapshots for current session.
   */
  getHistory: async (settingsId?: number): Promise<PeriodExclusionDto[]> => {
    const url = settingsId
      ? `${BASE}/exclusions/history?settingsId=${settingsId}`
      : `${BASE}/exclusions/history`;
    return apiClient.get(url);
  },

  /**
   * Activate a historical snapshot.
   */
  activateSnapshot: async (id: number): Promise<{ message: string }> => {
    return apiClient.put(`${BASE}/exclusions/${id}/activate`, {});
  },
};
