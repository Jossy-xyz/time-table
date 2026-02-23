import { apiClient } from "./apiClient";

export interface ExamSettingsPayload {
  schedule_policy: number;
  max_examl: number;
  min_examl: number;
  exam_level_high_limit: string;
}

/**
 * Institutional Examination Settings Service
 * Features: Type-safe interactions for exam configuration.
 */
export const examSettingsService = {
  create: async (data: ExamSettingsPayload): Promise<void> => {
    // Backend endpoint: /examtab/post
    await apiClient.post("/examtab/post", data);
  },
};
