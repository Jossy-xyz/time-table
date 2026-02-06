import { apiClient } from "./apiClient";
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
      return response;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  getAll: async (): Promise<Timetable[]> => {
    try {
      const response = await apiClient.get<Timetable[]>("/timetable");
      return response;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  getById: async (id: string): Promise<Timetable> => {
    try {
      const response = await apiClient.get<Timetable>(`/timetable/${id}`);
      return response;
    } catch (error: any) {
      throw handleApiError(error);
    }
  },

  export: async (id: string, format = "pdf"): Promise<Blob> => {
    try {
      // For blob response, we might need a specific handling in apiClient
      // or use fetch directly since apiClient.fetch assumes JSON or text by default
      // but let's check apiClient implementation again.
      // It returns parsed JSON or text.
      // We need to bypass the default parsing for Blob.
      // Let's use the underlying fetch or valid apiClient extension if possible.
      // Since existing apiClient doesn't support blob explicitly, we'll implement a specific fetch here.

      const { useAuthStore } = await import("../state/authStore");
      const { user } = useAuthStore.getState();
      const headers = new Headers();
      const actorUsername = user?.username || localStorage.getItem("username");
      if (actorUsername) headers.set("X-Actor-Username", actorUsername);

      const response = await fetch(
        `http://localhost:8080/timetable/${id}/export?format=${format}`,
        {
          headers,
        },
      );

      if (!response.ok) throw new Error("Export failed");
      return await response.blob();
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
