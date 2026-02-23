import { apiClient } from "./apiClient";
import { Program } from "../../types/institutional";

/**
 * Institutional Program Service
 * Features: Type-safe academic program interactions synchronized with Backend DTOs.
 */
export const programService = {
  getAll: async (): Promise<Program[]> => {
    const response = await apiClient.get("/program/get");
    return response as Program[];
  },

  getByDepartment: async (deptId: number): Promise<Program[]> => {
    const programs = await programService.getAll();
    return programs.filter(
      (p) => p.departmentId === deptId || p.deptID === deptId,
    );
  },

  create: async (programData: Partial<Program>): Promise<Program> => {
    const payload = {
      code: programData.code,
      name: programData.name,
      duration: programData.duration,
      totalCompulsoryUnits: programData.totalCompulsoryUnits,
      totalRequiredUnits: programData.totalRequiredUnits,
      minElectiveUnits: programData.minElectiveUnits,
      entryRequirements: programData.entryRequirements,
      department: programData.departmentId
        ? { id: programData.departmentId }
        : null,
    };
    const response = await apiClient.post("/program/post", payload);
    return response as Program;
  },
};
