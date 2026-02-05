import { apiClient } from "./apiClient";
import { Staff } from "../../types/institutional";

/**
 * Institutional Staff Service
 * Synchronized with Backend StaffDto and Actor scoper.
 */
export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    const response = await apiClient.get("/staff/get");
    return response as Staff[];
  },

  getById: async (id: number): Promise<Staff> => {
    const all = await staffService.getAll();
    const found = all.find((s) => s.id === id);
    if (!found) throw new Error("Staff not found");
    return found;
  },

  create: async (staffData: Partial<Staff>): Promise<void> => {
    const payload = {
      staffId: staffData.staffId,
      title: staffData.title,
      surname: staffData.surname,
      firstname: staffData.firstname,
      middlename: staffData.middlename,
      statusId: staffData.statusId,
      type: staffData.type,
      specialization: staffData.specialization,
      researchArea: staffData.researchArea,
      department: staffData.departmentId
        ? { id: staffData.departmentId }
        : undefined,
    };
    await apiClient.post("/staff/post", payload);
  },

  update: async (id: number, staffData: Partial<Staff>): Promise<Staff> => {
    const payload = {
      staffId: staffData.staffId,
      title: staffData.title,
      surname: staffData.surname,
      firstname: staffData.firstname,
      middlename: staffData.middlename,
      statusId: staffData.statusId,
      type: staffData.type,
      specialization: staffData.specialization,
      researchArea: staffData.researchArea,
      department: staffData.departmentId
        ? { id: staffData.departmentId }
        : undefined,
    };
    const response = await apiClient.put(`/staff/update/${id}`, payload);
    return response as Staff;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/staff/delete/${id}`);
  },
};
