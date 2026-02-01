import { apiClient } from "./apiClient";

interface TriggerResponse {
  message: string;
  status: string;
}

export const algorithmService = {
  trigger: async (): Promise<TriggerResponse> => {
    try {
      const response =
        await apiClient.post<TriggerResponse>("/algorithm/trigger");
      return response.data;
    } catch (error) {
      console.error("Failed to trigger algorithm", error);
      throw error;
    }
  },
};
