import { apiClient } from "./apiClient";
import { Venue } from "../../types/institutional";

/**
 * Institutional Venue Service
 * Synchronized with Backend VenueDto.
 */
export const venueService = {
  getAll: async (): Promise<Venue[]> => {
    const response = await apiClient.get("/venue/get");
    return response as Venue[];
  },

  getById: async (id: number): Promise<Venue> => {
    const all = await venueService.getAll();
    const found = all.find((v) => v.id === id);
    if (!found) throw new Error("Venue not found");
    return found;
  },

  create: async (venueData: Partial<Venue>): Promise<void> => {
    const payload = {
      venueCode: venueData.venueCode,
      name: venueData.name,
      capacity: venueData.capacity,
      actualCapacity: venueData.actualCapacity,
      type: venueData.type,
      preference: venueData.preference,
      inUse: venueData.inUse,
      centre: venueData.centreId ? { id: venueData.centreId } : null,
    };
    await apiClient.post("/venue/post", payload);
  },

  update: async (id: number, venueData: Partial<Venue>): Promise<Venue> => {
    const payload = {
      venueCode: venueData.venueCode,
      name: venueData.name,
      capacity: venueData.capacity,
      actualCapacity: venueData.actualCapacity,
      type: venueData.type,
      preference: venueData.preference,
      inUse: venueData.inUse,
      centre: venueData.centreId ? { id: venueData.centreId } : undefined,
    };
    const response = await apiClient.put(`/venue/update/${id}`, payload);
    return response as Venue;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/venue/delete/${id}`);
  },
};
