import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import { registrationService } from "./services/api/registrationService";
import { Registration } from "./types/institutional";

interface RegListProps {
  onRegList?: (val: string) => void;
}

/**
 * Legacy Academic Enrollment Ledger
 * Refactored for Type Safety during institutional migration.
 */
export default function RegistrationList({ onRegList }: RegListProps) {
  // Form State
  const [formData, setFormData] = useState<Partial<Registration>>({
    matricNo: "",
    courseCode: "",
    semester: 1,
    session: "2024/2025",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRegData, setEditRegData] = useState<Partial<Registration>>({});

  const handleRegistrationSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await registrationService.create(formData);
      toast.success("✅ Enrollment record committed to registry");
      if (onRegList) onRegList("");
      // Reset form
      setFormData({
        matricNo: "",
        courseCode: "",
        semester: 1,
        session: "2024/2025",
      });
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during enrollment sync");
    }
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await registrationService.getAll();
      setRegistrations(data);
    } catch (error: any) {
      toast.error(
        error.message || "Critical connection failure to enrollment ledger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleEditClick = (reg: Registration) => {
    setEditId(reg.id);
    setEditRegData({ ...reg });
  };

  const handleSave = async (id: number) => {
    try {
      await registrationService.update(id, editRegData);
      toast.success("Enrollment record modified in ledger");
      setEditId(null);
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.message || "Registry modification failed");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditRegData((prev) => ({
      ...prev,
      [name]: name === "semester" ? parseInt(value) : value,
    }));
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Purge enrollment record from academic ledger permanently?",
      )
    )
      return;
    try {
      await registrationService.delete(id);
      toast.success("Enrollment record purged successfully");
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during record purge");
    }
  };

  return (
    <div className="space-y-10 animate-fadeInUp">
      <form
        onSubmit={handleRegistrationSubmit}
        className="bg-surface p-8 rounded-institutional shadow-sm border border-brick/10"
      >
        <h2 className="text-lg font-black text-institutional-primary tracking-tight mb-6 border-b border-brick/5 pb-4">
          Enrollment Authorization
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Student Matric No
            </label>
            <input
              type="text"
              name="matricNo"
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.matricNo}
              onChange={(e) =>
                setFormData({ ...formData, matricNo: e.target.value })
              }
              placeholder="e.g. AUL/CMP/23/..."
            />
          </div>
          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Academic Session
            </label>
            <input
              type="text"
              name="session"
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.session}
              onChange={(e) =>
                setFormData({ ...formData, session: e.target.value })
              }
              placeholder="e.g. 2024/2025"
            />
          </div>
          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Semester Cycle
            </label>
            <input
              type="number"
              name="semester"
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Course Code
            </label>
            <input
              type="text"
              name="courseCode"
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.courseCode}
              onChange={(e) =>
                setFormData({ ...formData, courseCode: e.target.value })
              }
              placeholder="e.g. GST 101"
            />
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-brick/5">
          <button
            type="submit"
            className="px-10 py-3 bg-brick text-white rounded-institutional text-sm font-black uppercase tracking-widest shadow-lg shadow-brick/20 transition-transform active:scale-95"
          >
            Authorize Enrollment
          </button>
        </div>
      </form>

      <div className="student-list overflow-hidden">
        <h2 className="text-xl font-black text-brick uppercase tracking-widest mb-6">
          {isLoading ? "Synchronizing..." : "Academic Enrollment Ledger"}
        </h2>
        <div className="overflow-x-auto bg-surface border border-brick/10 rounded-institutional shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brick/5 text-[10px] font-black uppercase tracking-widest text-institutional-muted border-b border-brick/10">
                <th className="px-5 py-4">Matric NO</th>
                <th className="px-5 py-4">Session</th>
                <th className="px-5 py-4 text-center">Cycle</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brick/5 text-xs font-bold text-institutional-primary">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-brick/5 transition-colors">
                  {editId === reg.id ? (
                    <>
                      <td className="px-5 py-3">
                        <input
                          name="matricNo"
                          value={editRegData.matricNo}
                          onChange={handleInputChange}
                          className="w-full bg-page border border-brick/10 px-2 py-1 rounded"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          name="session"
                          value={editRegData.session}
                          onChange={handleInputChange}
                          className="w-full bg-page border border-brick/10 px-2 py-1 rounded"
                        />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <input
                          name="semester"
                          value={editRegData.semester}
                          onChange={handleInputChange}
                          className="w-full bg-page border border-brick/10 px-2 py-1 rounded text-center"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          name="courseCode"
                          value={editRegData.courseCode}
                          onChange={handleInputChange}
                          className="w-full bg-page border border-brick/10 px-2 py-1 rounded"
                        />
                      </td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleSave(reg.id)}
                          className="text-status-success hover:underline"
                        >
                          Commit
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-institutional-muted hover:underline"
                        >
                          Abort
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3">{reg.matricNo}</td>
                      <td className="px-5 py-3 font-mono">{reg.session}</td>
                      <td className="px-5 py-3 text-center opacity-70">
                        S{reg.semester}
                      </td>
                      <td className="px-5 py-3 font-bold text-gold-dark">
                        {reg.courseCode}
                      </td>
                      <td className="px-5 py-3 text-right space-x-3">
                        <button
                          onClick={() => handleEditClick(reg)}
                          className="text-brick hover:underline opacity-80 hover:opacity-100"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="text-status-error hover:underline opacity-80 hover:opacity-100"
                        >
                          Purge
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
    </div>
  );
}
