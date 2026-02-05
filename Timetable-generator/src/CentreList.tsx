import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiHome,
  FiCheckCircle,
} from "react-icons/fi";
import { collegeService } from "./services/api/collegeService";
import { Centre } from "./types/institutional";

interface CentreListProps {
  onCentreList?: (val: string) => void;
}

/**
 * Institutional Academic Centre Registry
 * Features: High-density data grid, unified branding, and refined administrative assets.
 */
export default function CentreList({ onCentreList }: CentreListProps) {
  const [formData, setFormData] = useState<Partial<Centre>>({
    code: "",
    name: "",
    type: 0,
    state: "",
  });

  const [centres, setCentres] = useState<Centre[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editCentreData, setEditCentreData] = useState<Partial<Centre>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChangeForm = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCentreSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await collegeService.create(formData);
      toast.success("✅ Academic centre established in registry");
      if (onCentreList) onCentreList("");
      setFormData({ code: "", name: "", type: 0, state: "" });
      fetchCentres();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during centre sync");
    }
  };

  const fetchCentres = async () => {
    setIsLoading(true);
    try {
      const data = await collegeService.getAll();
      setCentres(data);
    } catch (error: any) {
      toast.error(
        error.message || "Critical connection failure to centre ledger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const handleEditClick = (centre: Centre) => {
    setEditId(centre.id);
    setEditCentreData({ ...centre });
  };

  const handleSave = async (id: number) => {
    // Note: Update not explicitly implemented in collegeService yet, adding it here or update service
    toast.info(
      "Update logic trigger - synchronization pending backend endpoint verification",
    );
    setEditId(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Purge academic centre from registry permanently?"))
      return;
    toast.info(
      "Delete logic trigger - synchronization pending backend endpoint verification",
    );
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Registration Surface */}
      <section className="bg-surface p-8 rounded-institutional border border-brick/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-brick" />
        <div className="flex items-center gap-3 mb-8 border-b border-brick/5 pb-4">
          <FiHome className="text-brick text-xl" />
          <h2 className="text-lg font-black text-institutional-primary tracking-tight">
            Establish Academic Centre
          </h2>
        </div>

        <form onSubmit={handleCentreSubmit} className="space-y-6">
          <div className="form-grid-institutional">
            {[
              {
                label: "Centre Code",
                name: "code",
                placeholder: "e.g. CEN-01",
              },
              { label: "Official Designation", name: "name" },
              { label: "Category / Type", name: "type" },
              { label: "Region / State", name: "state" },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                  value={(formData as any)[field.name]}
                  onChange={handleInputChangeForm}
                />
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-brick/5">
            <button
              type="submit"
              className="px-12 py-3.5 bg-brick text-white rounded-institutional text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brick/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <FiCheckCircle /> Inaugurate Centre
            </button>
          </div>
        </form>
      </section>

      {/* Ledger Surface */}
      <div className="institutional-table-container">
        <h2 className="px-6 py-4 text-xs font-black uppercase tracking-widest text-brick border-b border-brick/10">
          {isLoading
            ? "Synchronizing Centre Registry..."
            : "Academic Centre Registry"}
        </h2>
        <table className="institutional-table">
          <thead>
            <tr>
              <th>Internal Code</th>
              <th>Centre Designation</th>
              <th className="text-center">Tier / Category</th>
              <th className="text-center">Region</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brick/5">
            {centres.map((centre) => (
              <tr
                key={centre.id}
                className="hover:bg-brick/5 transition-colors group"
              >
                {editId === centre.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editCentreData.code}
                        onChange={(e) =>
                          setEditCentreData((p) => ({
                            ...p,
                            code: e.target.value,
                          }))
                        }
                        className="w-24 bg-page border border-brick/20 px-2 py-1 rounded text-xs font-bold font-mono"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editCentreData.name}
                        onChange={(e) =>
                          setEditCentreData((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        value={editCentreData.type}
                        onChange={(e) =>
                          setEditCentreData((p) => ({
                            ...p,
                            type: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-16 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        value={editCentreData.state}
                        onChange={(e) =>
                          setEditCentreData((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                        className="w-16 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                      />
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleSave(centre.id)}
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
                      {centre.code}
                    </td>
                    <td className="text-sm font-bold uppercase tracking-tight">
                      {centre.name}
                    </td>
                    <td className="text-center">
                      <span className="status-pill status-pill-info">
                        {centre.type || "Standard"}
                      </span>
                    </td>
                    <td className="text-center font-bold opacity-60">
                      {centre.state || "N/A"}
                    </td>
                    <td className="text-right space-x-1">
                      <button
                        onClick={() => handleEditClick(centre)}
                        className="p-2 text-brick opacity-0 group-hover:opacity-100 hover:bg-brick/10 rounded-full transition-all duration-300"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(centre.id)}
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
