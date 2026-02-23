import { apiClient } from "./apiClient";

export interface OutputSettings {
  id?: number;
  invigilator_ratio: number;
  invigilator_special_ratio: number;
  venue_alg: number;
  venue_alg_order: number;
  mix_exams: number;
  more_space: number;
  le_fullyinV: number;
  use_half_venue: number;
  select_staff_random: number;
  use_staff_ids: number;
  update_staff_duty: number;
  skip_week: number;
  gen_sitting_arr: number;
  save_file: number;
  save_to_db: number;
  created_at?: string;
}

export const outputSettingsService = {
  get: async (): Promise<OutputSettings> => {
    const { data } = await apiClient.get("/output/get");
    return data;
  },

  save: async (payload: OutputSettings): Promise<OutputSettings> => {
    const { data } = await apiClient.post("/output/save", payload);
    return data;
  },
};
