import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import { studentSemRegService } from "./services/api/studentSemRegService";
import { StudentSemesterRegistration } from "./types/institutional";

interface StudentsemregListProps {
  onStudentsemregList?: (val: string) => void;
}

/**
 * Semester Enrollment View
 * Refactored for Type Safety utilizing StudentSemesterRegistration.
 */
export default function StudentsemregList({
  onStudentsemregList,
}: StudentsemregListProps) {
  // Form State
  const [formData, setFormData] = useState<
    Partial<StudentSemesterRegistration>
  >({
    matric_NO: "",
    course_Code_List: "",
    session: "2024/2025",
    semester: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [regs, setRegs] = useState<StudentSemesterRegistration[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRegData, setEditRegData] = useState<
    Partial<StudentSemesterRegistration>
  >({});

  const handleStudentSemSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await studentSemRegService.create(formData);
      toast.success("✅ Semester registration committed to registry");
      if (onStudentsemregList) onStudentsemregList("");
      // Reset form
      setFormData({
        matric_NO: "",
        course_Code_List: "",
        session: "2024/2025",
        semester: 1,
      });
      fetchStudentSemReg();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during registration sync");
    }
  };

  const fetchStudentSemReg = async () => {
    setIsLoading(true);
    try {
      const data = await studentSemRegService.getAll();
      setRegs(data);
    } catch (error: any) {
      toast.error(
        error.message || "Critical connection failure to registration ledger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentSemReg();
  }, []);

  const handleEditClick = (reg: StudentSemesterRegistration) => {
    setEditId(reg.id);
    setEditRegData({ ...reg });
  };

  const handleSave = async (id: number) => {
    try {
      await studentSemRegService.update(id, editRegData);
      toast.success("Semester registration modified in ledger");
      setEditId(null);
      fetchStudentSemReg();
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
    if (!window.confirm("Purge semester registration record permanently?"))
      return;
    try {
      await studentSemRegService.delete(id);
      toast.success("Registration record purged successfully");
      fetchStudentSemReg();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during record purge");
    }
  };

  return (
    <div className="space-y-10 animate-fadeInUp">
      <form
        onSubmit={handleStudentSemSubmit}
        className="bg-surface p-8 rounded-institutional shadow-sm border border-brick/10"
      >
        <h2 className="text-lg font-black text-institutional-primary tracking-tight mb-6 border-b border-brick/5 pb-4">
          Semester Course Enrollment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Student Matric No
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.matric_NO}
              onChange={(e) =>
                setFormData({ ...formData, matric_NO: e.target.value })
              }
            />
          </div>
          <div className="input-group lg:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Academic Session
            </label>
            <input
              type="text"
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
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: parseInt(e.target.value) })
              }
            />
          </div>
          <div className="input-group lg:col-span-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Authenticated Course Code List
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.course_Code_List}
              onChange={(e) =>
                setFormData({ ...formData, course_Code_List: e.target.value })
              }
              placeholder="e.g. CSC 101, MTH 101"
            />
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-brick/5">
          <button
            type="submit"
            className="px-10 py-3 bg-brick text-white rounded-institutional text-sm font-black uppercase tracking-widest shadow-lg shadow-brick/20 transition-transform active:scale-95"
          >
            Enroll Semester Courses
          </button>
        </div>
      </form>

      <div className="student-list overflow-hidden">
        <h2 className="text-xl font-black text-brick uppercase tracking-widest mb-6">
          {isLoading ? "Synchronizing..." : "Semester Enrollment Ledger"}
        </h2>
        <div className="overflow-x-auto bg-surface border border-brick/10 rounded-institutional shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brick/5 text-[10px] font-black uppercase tracking-widest text-institutional-muted border-b border-brick/10">
                <th className="px-5 py-4">Student ID</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Session</th>
                <th className="px-5 py-4 text-center">Cycle</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brick/5 text-xs font-bold text-institutional-primary">
              {regs.map((reg) => (
                <tr key={reg.id} className="hover:bg-brick/5 transition-colors">
                  {editId === reg.id ? (
                    <>
                      <td className="px-5 py-3 opacity-60">{reg.studentId}</td>
                      <td className="px-5 py-3">
                        <input
                          name="level"
                          value={editRegData.level}
                          onChange={handleInputChange}
                          className="w-16 bg-page border border-brick/10 px-2 py-1 rounded"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <input
                          name="session"
                          value={editRegData.session}
                          onChange={handleInputChange}
                          className="w-full bg-page border border-brick/10 px-2 py-1 rounded font-mono"
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
                      <td className="px-5 py-3 font-mono text-brick">
                        {/* Assuming matricNo not available on getAll dto, using StudentID */}
                        STU-{reg.studentId}
                      </td>
                      <td className="px-5 py-3 font-bold">{reg.level}L</td>
                      <td className="px-5 py-3 font-mono">{reg.session}</td>
                      <td className="px-5 py-3 text-center opacity-60">
                        S{reg.semester}
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
