import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiAward,
  FiBookOpen,
  FiChevronDown,
} from "react-icons/fi";
import { departmentService } from "./services/api/departmentService";
import { programService } from "./services/api/programService";
import { Programme, Department } from "./types/institutional";

interface ProgramListProps {
  onProgramList?: (val: string) => void;
}

/**
 * Institutional Academic Programme Registry
 * Features: High-density data grid, unified branding, and refined administrative assets.
 */
export default function ProgramList({ onProgramList }: ProgramListProps) {
  const [formData, setFormData] = useState<Partial<Programme>>({
    code: "",
    name: "",
    departmentId: undefined,
    duration: 4,
    totalCompulsoryUnits: 0,
    totalRequiredUnits: 0,
    minElectiveUnits: 0,
    entryRequirements: "",
  });

  const [programs, setPrograms] = useState<Programme[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editProgData, setEditProgData] = useState<Partial<Programme>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChangeForm = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: [
        "duration",
        "totalCompulsoryUnits",
        "totalRequiredUnits",
        "minElectiveUnits",
      ].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleProgramSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await programService.create(formData);
      toast.success("✅ Academic programme added to registry");
      if (onProgramList) onProgramList("");
      setFormData({
        code: "",
        name: "",
        departmentId: undefined,
        duration: 4,
        totalCompulsoryUnits: 0,
        totalRequiredUnits: 0,
        minElectiveUnits: 0,
        entryRequirements: "",
      });
      fetchPrograms();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during programme sync");
    }
  };

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const data = await programService.getAll();
      setPrograms(data);
    } catch (error: any) {
      toast.error(
        error.message || "Critical connection failure to programme ledger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error: any) {
      console.error("Failed to fetch departments", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const handleEditClick = (program: Programme) => {
    setEditId(program.id);
    setEditProgData({ ...program });
  };

  const handleSave = async (id: number) => {
    toast.info(
      "Update logic trigger - synchronization pending backend endpoint verification",
    );
    setEditId(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Purge academic programme from registry permanently?"))
      return;
    toast.info(
      "Delete logic trigger - synchronization pending backend endpoint verification",
    );
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Registration Section */}
      <section className="bg-surface p-8 rounded-institutional border border-brick/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brick/5 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center gap-3 mb-8 border-b border-brick/5 pb-4">
          <FiAward className="text-brick text-xl" />
          <h2 className="text-lg font-black text-institutional-primary tracking-tight">
            Define Academic Programme
          </h2>
        </div>

        <form onSubmit={handleProgramSubmit} className="space-y-6">
          <div className="form-grid-institutional">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Programme Code
              </label>
              <input
                type="text"
                name="code"
                placeholder="e.g. B.Sc. CSC"
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                value={formData.code}
                onChange={handleInputChangeForm}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Official Designation
              </label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                value={formData.name}
                onChange={handleInputChangeForm}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Dept Affinity
              </label>
              <div className="relative">
                <select
                  name="departmentId"
                  className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all appearance-none"
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      departmentId: parseInt(e.target.value),
                    }))
                  }
                >
                  <option value="">Select Dept</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-institutional-muted">
                  <FiChevronDown />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Duration (Yrs)
              </label>
              <input
                type="number"
                name="duration"
                min="1"
                max="10"
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                value={formData.duration}
                onChange={handleInputChangeForm}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Total Comp. Units
              </label>
              <input
                type="number"
                name="totalCompulsoryUnits"
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                value={formData.totalCompulsoryUnits}
                onChange={handleInputChangeForm}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Total Req. Units
              </label>
              <input
                type="number"
                name="totalRequiredUnits"
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                value={formData.totalRequiredUnits}
                onChange={handleInputChangeForm}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Min. Elective Units
              </label>
              <input
                type="number"
                name="minElectiveUnits"
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                value={formData.minElectiveUnits}
                onChange={handleInputChangeForm}
              />
            </div>

            <div className="space-y-2 col-span-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Entry Requirements
              </label>
              <textarea
                name="entryRequirements"
                rows={2}
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all resize-none"
                value={formData.entryRequirements}
                onChange={handleInputChangeForm}
                placeholder="Specific academic requirements..."
              />
            </div>
          </div>
          <div className="pt-4 border-t border-brick/5">
            <button
              type="submit"
              className="px-12 py-3.5 bg-brick text-white rounded-institutional text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brick/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <FiBookOpen /> Enroll Degree Programme
            </button>
          </div>
        </form>
      </section>

      {/* Ledger Section */}
      <div className="institutional-table-container">
        <h2 className="px-6 py-4 text-xs font-black uppercase tracking-widest text-brick border-b border-brick/10">
          {isLoading
            ? "Synchronizing Programme Registry..."
            : "Academic Programme Registry"}
        </h2>
        <table className="institutional-table">
          <thead>
            <tr>
              <th>Programme Code</th>
              <th>Official Designation</th>
              <th className="text-center">Dept Affinity</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brick/5">
            {programs.map((prog) => (
              <tr
                key={prog.id}
                className="hover:bg-brick/5 transition-colors group"
              >
                {editId === prog.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editProgData.code}
                        onChange={(e) =>
                          setEditProgData((p) => ({
                            ...p,
                            code: e.target.value,
                          }))
                        }
                        className="w-24 bg-page border border-brick/20 px-2 py-1 rounded text-xs font-bold font-mono"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editProgData.name}
                        onChange={(e) =>
                          setEditProgData((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <select
                        value={editProgData.departmentId}
                        onChange={(e) =>
                          setEditProgData((p) => ({
                            ...p,
                            departmentId: parseInt(e.target.value),
                          }))
                        }
                        className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs font-bold"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.code || dept.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleSave(prog.id)}
                        className="p-1.5 text-status-success hover:bg-status-success/10 rounded transition-colors"
                      >
                        <FiSave size={14} />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="p-1.5 text-institutional-muted hover:bg-page rounded transition-colors"
                      >
                        <FiXCircle size={14} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="font-mono text-brick font-black tracking-tighter">
                      {prog.code}
                    </td>
                    <td className="text-sm font-bold uppercase tracking-tight">
                      {prog.name}
                    </td>
                    <td className="text-center font-black opacity-30">
                      {departments.find((d) => d.id === prog.departmentId)
                        ?.code || `DEPT-${prog.departmentId}`}
                    </td>
                    <td className="text-right space-x-1">
                      <button
                        onClick={() => handleEditClick(prog)}
                        className="p-2 text-brick opacity-0 group-hover:opacity-100 hover:bg-brick/10 rounded-full transition-all duration-300"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(prog.id)}
                        className="p-2 text-status-error opacity-0 group-hover:opacity-100 hover:bg-status-error/10 rounded-full transition-all duration-300"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
