import React, { useEffect, useState, ChangeEvent } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiSave, FiXCircle, FiSearch } from "react-icons/fi";
import { studentService } from "./services/api/studentService";
import { Student } from "./types/institutional";

interface StudentListProps {
  onStudentList?: () => void;
}

/**
 * Institutional Student Registry Ledger
 * Features: High-density data grid, deterministic state management, and unified branding.
 */
export default function StudentList({ onStudentList }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error: any) {
      toast.error(error.message || "Critical connection failure to registry");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Institutional standard for ledger view

  const filteredStudents = students.filter((student) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      student.matricNo?.toLowerCase().includes(searchStr) ||
      student.fullName?.toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEditClick = (student: Student) => {
    setEditId(student.id);
    setEditData({ ...student });
  };

  const handleSave = async (id: string) => {
    try {
      await studentService.update(id, editData);
      toast.success("Student record committed to registry");
      setEditId(null);
      fetchStudents();
      if (onStudentList) onStudentList();
    } catch (error: any) {
      toast.error(error.message || "Registry update failed");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: name === "level" ? parseInt(value) : value,
    }));
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm("Purge student record from academic ledger permanently?")
    )
      return;
    try {
      await studentService.delete(id);
      toast.success("Student record purged successfully");
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Purge operation failed");
    }
  };

  return (
    <div className="institutional-table-container animate-fade-in">
      <div className="p-4 border-b border-brick/10 bg-page/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 max-w-2xl gap-2">
          <div className="relative flex-1 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brick group-focus-within:scale-110 transition-transform">
              <FiSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by Matric No or Name..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="text-[10px] font-black uppercase text-institutional-muted tracking-widest bg-brick/5 px-3 py-2 rounded-full border border-brick/10 inline-flex items-center self-start md:self-center">
          {isLoading
            ? "Synchronizing..."
            : `Registry Ledger: ${filteredStudents.length} matches`}
        </div>
      </div>

      <table className="institutional-table">
        <thead>
          <tr>
            <th>Matric No.</th>
            <th>Full Name</th>
            <th className="text-center">Level</th>
            <th className="text-center">Academic Programme</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brick/5">
          {paginatedStudents.map((student) => (
            <tr
              key={student.id}
              className="hover:bg-brick/5 transition-colors group"
            >
              {editId === student.id ? (
                <>
                  <td className="px-3 py-2">
                    <input
                      name="matricNo"
                      value={editData.matricNo || ""}
                      onChange={handleInputChange}
                      className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                      readOnly // Natural keys shouldn't be edited
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="fullName"
                      value={editData.fullName || ""}
                      onChange={handleInputChange}
                      placeholder="FullName"
                      className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="level"
                      value={editData.level || 100}
                      onChange={handleInputChange}
                      className="w-20 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name="programme"
                      value={editData.programme || ""}
                      onChange={handleInputChange}
                      placeholder="Programme"
                      className="w-full mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                    />
                  </td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button
                      onClick={() => handleSave(student.id)}
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
                    {student.matricNo}
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="uppercase tracking-tight text-xs font-bold">
                        {student.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="status-pill status-pill-info">
                      {student.level}L
                    </span>
                  </td>
                  <td className="text-center font-mono text-[10px] opacity-60 italic">
                    {student.programme}
                  </td>
                  <td className="text-right space-x-1">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="p-2 text-brick opacity-0 group-hover:opacity-100 hover:bg-brick/10 rounded-full transition-all duration-300"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-brick/10 rounded text-[10px] font-black uppercase disabled:opacity-50 hover:bg-brick/5 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {!isLoading && filteredStudents.length === 0 && (
        <div className="py-20 text-center opacity-40 italic">
          {searchQuery
            ? `No records found matching "${searchQuery}"`
            : "No institutional student records found in current ledger section."}
        </div>
      )}
    </div>
  );
}
