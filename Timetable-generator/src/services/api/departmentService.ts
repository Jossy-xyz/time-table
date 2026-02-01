import { apiClient } from "./apiClient";
import { Department } from "../../types/institutional";

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get("/department/get");
    return response as Department[];
  },

  getByCollege: async (collegeId: number): Promise<Department[]> => {
    const departments = await departmentService.getAll();
    return departments.filter((d) => d.collegeId === collegeId);
  },

  create: async (departmentData: Partial<Department>): Promise<void> => {
    const payload = {
      code: departmentData.code,
      name: departmentData.name,
      centre: { id: departmentData.collegeId },
    };
    await apiClient.post("/department/post", payload);
  },
};
