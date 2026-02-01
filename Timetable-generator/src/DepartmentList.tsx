import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiLayers,
  FiActivity,
  FiChevronDown,
} from "react-icons/fi";
import { collegeService } from "./services/api/collegeService";
import { departmentService } from "./services/api/departmentService";
import { Department } from "./types/institutional";

interface DepartmentListProps {
  onDepartList?: (val: string) => void;
}

/**
 * Institutional Departmental Administrative Surface
 * Features: High-density data grid, unified branding, and refined administrative assets.
 */
export default function DepartmentList({ onDepartList }: DepartmentListProps) {
  const [formData, setFormData] = useState<Partial<Department>>({
    code: "",
    name: "",
    collegeId: undefined,
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const { data: colleges = [] } = useQuery({
    queryKey: ["colleges"],
    queryFn: collegeService.getAll,
    staleTime: 1000 * 60 * 30,
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [editDeptData, setEditDeptData] = useState<Partial<Department>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChangeForm = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await departmentService.create(formData);
      toast.success("✅ Academic department committed to registry");
      if (onDepartList) onDepartList("");
      setFormData({ code: "", name: "", collegeId: undefined });
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during department sync");
    }
  };

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error: any) {
      toast.error(
        error.message || "Critical connection failure to department ledger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleEditClick = (department: Department) => {
    setEditId(department.id);
    setEditDeptData({ ...department });
  };

  const handleSave = async (id: number) => {
    toast.info(
      "Update logic trigger - synchronization pending backend endpoint verification",
    );
    setEditId(null);
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Purge academic department from faculty ledger permanently?",
      )
    )
      return;
    toast.info(
      "Delete logic trigger - synchronization pending backend endpoint verification",
    );
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Configuration Section */}
      <section className="bg-surface p-8 rounded-institutional border border-brick/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brick/5 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center gap-3 mb-8 border-b border-brick/5 pb-4">
          <FiLayers className="text-brick text-xl" />
          <h2 className="text-lg font-black text-institutional-primary tracking-tight">
            Define Faculty Department
          </h2>
        </div>

        <form onSubmit={handleDepartmentSubmit} className="space-y-6">
          <div className="form-grid-institutional">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Department Code
              </label>
              <input
                type="text"
                name="code"
                placeholder="e.g. CSC / MTH"
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                value={formData.code}
                onChange={handleInputChangeForm}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Affiliated College
              </label>
              <div className="relative">
                <select
                  name="collegeId"
                  className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all appearance-none"
                  value={formData.collegeId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      collegeId: parseInt(e.target.value),
                    }))
                  }
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-institutional-muted">
                  <FiChevronDown />
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                Full Academic Name
              </label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                value={formData.name}
                onChange={handleInputChangeForm}
              />
            </div>
          </div>
          <div className="pt-4 border-t border-brick/5">
            <button
              type="submit"
              className="px-12 py-3.5 bg-brick text-white rounded-institutional text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brick/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <FiActivity /> Establish Departmental Sector
            </button>
          </div>
        </form>
      </section>

      {/* Ledger Section */}
      <div className="institutional-table-container">
        <h2 className="px-6 py-4 text-xs font-black uppercase tracking-widest text-brick border-b border-brick/10">
          {isLoading
            ? "Synchronizing Department Registry..."
            : "Academic Department Registry"}
        </h2>
        <table className="institutional-table">
          <thead>
            <tr>
              <th>Dept. Code</th>
              <th>Official Designation</th>
              <th className="text-center">Affinity</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brick/5">
            {departments.map((dept) => (
              <tr
                key={dept.id}
                className="hover:bg-brick/5 transition-colors group"
              >
                {editId === dept.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editDeptData.code}
                        onChange={(e) =>
                          setEditDeptData((p) => ({
                            ...p,
                            code: e.target.value,
                          }))
                        }
                        className="w-24 bg-page border border-brick/20 px-2 py-1 rounded text-xs font-bold font-mono"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editDeptData.name}
                        onChange={(e) =>
                          setEditDeptData((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <select
                        value={editDeptData.collegeId}
                        onChange={(e) =>
                          setEditDeptData((p) => ({
                            ...p,
                            collegeId: parseInt(e.target.value),
                          }))
                        }
                        className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs font-bold"
                      >
                        {colleges.map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.code || college.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleSave(dept.id)}
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
                      {dept.code}
                    </td>
                    <td className="text-sm font-bold uppercase tracking-tight">
                      {dept.name}
                    </td>
                    <td className="text-center font-black opacity-80">
                      <span className="status-pill status-pill-info">
                        {colleges.find((c) => c.id === dept.collegeId)?.code ||
                          `COL-${dept.collegeId}`}
                      </span>
                    </td>
                    <td className="text-right space-x-1">
                      <button
                        onClick={() => handleEditClick(dept)}
                        className="p-2 text-brick opacity-0 group-hover:opacity-100 hover:bg-brick/10 rounded-full transition-all duration-300"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
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
