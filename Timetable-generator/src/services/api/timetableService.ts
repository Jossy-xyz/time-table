import apiClient from "./client";
import { handleApiError } from "../../utils/errorHandler";
import { TimetableSlot } from "../../types/institutional";

interface Timetable {
  id: string;
  name: string;
  slots: TimetableSlot[];
  status: "DRAFT" | "FINALIZED";
  academicSession: string;
  semester: number;
}

/**
 * Institutional Timetable Service
 * Features: Type-safe academic scheduling and resource orchestration.
 */
export const timetableService = {
  generate: async (settings: any): Promise<Timetable> => {
    try {
      const response = await apiClient.post<Timetable>(
        "/timetable/generate",
        settings,
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  getAll: async (): Promise<Timetable[]> => {
    try {
      const response = await apiClient.get<Timetable[]>("/timetable");
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  getById: async (id: string): Promise<Timetable> => {
    try {
      const response = await apiClient.get<Timetable>(`/timetable/${id}`);
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  export: async (id: string, format = "pdf"): Promise<Blob> => {
    try {
      const response = await apiClient.get(
        `/timetable/${id}/export?format=${format}`,
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/timetable/${id}`);
    } catch (error: any) {
      throw handleApiError(error);
    }
  },
};
