import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiUserPlus,
  FiSearch,
} from "react-icons/fi";
import { staffService } from "./services/api/staffService";
import { Staff } from "./types/institutional";

interface StaffListProps {
  onStaffList?: (val: string) => void;
}

/**
 * Institutional Academic Staff Registry
 * Features: High-density personnel data grid, unified branding, and refined administrative actions.
 */
export default function StaffList({ onStaffList }: StaffListProps) {
  // Form State
  const [formData, setFormData] = useState<Partial<Staff>>({
    title: "",
    surname: "",
    firstname: "",
    middlename: "",
    staffId: "",
    statusId: 1,
    type: 1,
    specialization: "",
    researchArea: "",
  });

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editStaffData, setEditStaffData] = useState<Partial<Staff>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await staffService.getAll();
      setStaffs(data);
    } catch (error: any) {
      toast.error(
        error.message || "Critical connection failure to personnel ledger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staffs.filter((staff) => {
    const searchStr = searchQuery.toLowerCase();
    const fullName =
      `${staff.title || ""} ${staff.firstname || ""} ${staff.surname || ""}`.toLowerCase();
    return (
      fullName.includes(searchStr) ||
      staff.staffId?.toLowerCase().includes(searchStr) ||
      staff.specialization?.toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const submitStaff = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.surname || !formData.firstname || !formData.staffId) {
      toast.warn(
        "Verify all mandatory academic personnel fields (Surname, Firstname, Staff ID)",
      );
      return;
    }

    try {
      await staffService.create(formData);
      toast.success("✅ Academic personnel record committed to registry");
      if (onStaffList) onStaffList("");
      fetchStaff();
      setFormData({
        title: "",
        surname: "",
        firstname: "",
        middlename: "",
        staffId: "",
        statusId: 1,
        type: 1,
        specialization: "",
        researchArea: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Critical failure during personnel sync");
    }
  };

  const handleEditClick = (staff: Staff) => {
    setEditId(staff.id);
    setEditStaffData({ ...staff });
  };

  const handleSave = async (id: number) => {
    try {
      await staffService.update(id, editStaffData);
      toast.success("Personnel record modified in ledger");
      setEditId(null);
      fetchStaff();
    } catch (error: any) {
      toast.error("Registry modification failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm("Purge personnel record from faculty ledger permanently?")
    )
      return;
    try {
      await staffService.delete(id);
      toast.success("Personnel record purged successfully");
      fetchStaff();
    } catch (error: any) {
      toast.error("Critical failure during personnel purge");
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Registration Surface */}
      <section className="bg-surface p-8 rounded-institutional border border-brick/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-brick" />
        <div className="flex items-center gap-3 mb-8 border-b border-brick/5 pb-4">
          <FiUserPlus className="text-brick text-xl" />
          <h2 className="text-lg font-black text-institutional-primary tracking-tight">
            Personnel Enrollment Interface
          </h2>
        </div>

        <form onSubmit={submitStaff} className="space-y-6">
          <div className="form-grid-institutional">
            {[
              { label: "Title", name: "title", placeholder: "e.g. Dr.(Mrs)" },
              { label: "Surname", name: "surname" },
              { label: "First Name", name: "firstname" },
              { label: "Middle Name", name: "middlename" },
              { label: "Staff ID", name: "staffId" },
              { label: "Specialization", name: "specialization" },
              { label: "Research Area", name: "researchArea" },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
                  value={(formData as any)[field.name]}
                  onChange={handleFormChange}
                />
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-brick/5">
            <button
              type="submit"
              className="px-12 py-3.5 bg-brick text-white rounded-institutional text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brick/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Commit Entry to Faculty Ledger
            </button>
          </div>
        </form>
      </section>

      {/* Registry Surface */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-brick uppercase tracking-widest">
              Faculty Ledger
            </h2>
          </div>
        </div>

        <div className="institutional-table-container">
          <div className="p-4 border-b border-brick/10 bg-page/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-1 max-w-2xl gap-2">
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brick group-focus-within:scale-110 transition-transform">
                  <FiSearch size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name, ID or Specialization..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="text-[10px] font-black uppercase text-institutional-muted tracking-widest bg-brick/5 px-3 py-2 rounded-full border border-brick/10 inline-flex items-center self-start md:self-center">
              {isLoading
                ? "Synchronizing..."
                : `Personnel Registry: ${filteredStaff.length} records`}
            </div>
          </div>

          <table className="institutional-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th className="text-center">Staff ID</th>
                <th className="text-center">Status</th>
                <th>Specialization</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brick/5">
              {paginatedStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className="hover:bg-brick/5 transition-colors group"
                >
                  {editId === staff.id ? (
                    <>
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-1">
                          <input
                            value={editStaffData.title}
                            placeholder="Title"
                            onChange={(e) =>
                              setEditStaffData((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                            className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                          />
                          <input
                            value={editStaffData.surname}
                            placeholder="Surname"
                            onChange={(e) =>
                              setEditStaffData((p) => ({
                                ...p,
                                surname: e.target.value,
                              }))
                            }
                            className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                          />
                          <input
                            value={editStaffData.firstname}
                            placeholder="Firstname"
                            onChange={(e) =>
                              setEditStaffData((p) => ({
                                ...p,
                                firstname: e.target.value,
                              }))
                            }
                            className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          value={editStaffData.staffId}
                          onChange={(e) =>
                            setEditStaffData((p) => ({
                              ...p,
                              staffId: e.target.value,
                            }))
                          }
                          className="w-24 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="number"
                          value={editStaffData.statusId}
                          onChange={(e) =>
                            setEditStaffData((p) => ({
                              ...p,
                              statusId: parseInt(e.target.value),
                            }))
                          }
                          className="w-20 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editStaffData.specialization}
                          onChange={(e) =>
                            setEditStaffData((p) => ({
                              ...p,
                              specialization: e.target.value,
                            }))
                          }
                          className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                        />
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <button
                          onClick={() => handleSave(staff.id)}
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
                      <td>
                        <div className="flex flex-col">
                          <span className="text-sm font-black uppercase tracking-tight">
                            {staff.title} {staff.surname} {staff.firstname}
                          </span>
                          <span className="text-[10px] opacity-40 italic">
                            {staff.middlename || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="text-center font-mono text-[10px] font-black opacity-60 tracking-wider">
                        [{staff.staffId}]
                      </td>
                      <td className="text-center">
                        <span className="status-pill status-pill-info">
                          {staff.statusId === 1 ? "Active" : "On Leave"}
                        </span>
                      </td>
                      <td>
                        <span className="text-[10px] font-black uppercase text-institutional-muted tracking-widest">
                          {staff.specialization}
                        </span>
                      </td>
                      <td className="text-right space-x-1">
                        <button
                          onClick={() => handleEditClick(staff)}
                          className="p-2 text-brick opacity-0 group-hover:opacity-100 hover:bg-brick/10 rounded-full transition-all duration-300"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
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

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-4 border-t border-brick/10 bg-page/30">
              <p className="text-[10px] uppercase font-bold text-institutional-muted tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-brick/10 rounded text-[10px] font-black uppercase disabled:opacity-50 hover:bg-brick/5 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-brick/10 rounded text-[10px) font-black uppercase disabled:opacity-50 hover:bg-brick/5 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
