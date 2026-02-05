import { apiClient } from "./apiClient";

interface TriggerResponse {
  message: string;
  status: string;
}

export const algorithmService = {
  trigger: async (
    generalSettingsId?: number,
    constraintId?: number,
    exclusionSnapshotId?: number,
  ): Promise<TriggerResponse> => {
    try {
      const params = new URLSearchParams();
      if (generalSettingsId)
        params.append("generalSettingsId", generalSettingsId.toString());
      if (constraintId) params.append("constraintId", constraintId.toString());
      if (exclusionSnapshotId)
        params.append("exclusionSnapshotId", exclusionSnapshotId.toString());

      const url = `/algorithm/trigger?${params.toString()}`;
      const response = await apiClient.post<TriggerResponse>(url);
      return response;
    } catch (error) {
      console.error("Failed to trigger algorithm", error);
      throw error;
    }
  },
};
