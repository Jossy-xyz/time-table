import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiBookOpen,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { courseService } from "./services/api/courseService";
import { Course } from "./types/institutional";

interface CourseListProps {
  onCourseList?: (val: string) => void;
}

/**
 * Institutional Curriculum Asset Ledger
 * Features: High-density data grid, unified branding, and refined curriculum orchestration.
 */
export default function CourseList({ onCourseList }: CourseListProps) {
  const [formData, setFormData] = useState<Partial<Course>>({
    code: "",
    title: "",
    unit: 0,
    semester: 1,
    enrollmentCount: 0,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [editCourseData, setEditCourseData] = useState<Partial<Course>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChangeForm = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["unit", "semester", "enrollmentCount"].includes(name)
        ? parseInt(value)
        : value,
    }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getAll();
      setCourses(data);
    } catch (error: any) {
      toast.error(
        error.message || "Critical connection failure to curriculum ledger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      course.code?.toLowerCase().includes(searchStr) ||
      course.title?.toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleCourseSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.title) {
      toast.warn("Verify all mandatory curriculum fields");
      return;
    }

    const codeRegex = /^[A-Z]{3,4}\s?\d{3}$/;
    if (!codeRegex.test(formData.code.toUpperCase())) {
      toast.error("Format Error: Course code invalid (e.g. CSC 401)");
      return;
    }

    try {
      await courseService.create(formData);
      toast.success("✅ Curriculum record committed to registry");
      if (onCourseList) onCourseList("");
      setFormData({
        code: "",
        title: "",
        unit: 0,
        semester: 1,
        enrollmentCount: 0,
      });
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during curriculum sync");
    }
  };

  const handleEditClick = (course: Course) => {
    setEditId(course.id);
    setEditCourseData({ ...course });
  };

  const handleSave = async (id: string | number) => {
    try {
      await courseService.update(id, editCourseData);
      toast.success("Curriculum record modified in ledger");
      setEditId(null);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || "Registry modification failed");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (
      !window.confirm(
        "Purge curriculum record from academic ledger permanently?",
      )
    )
      return;
    try {
      await courseService.delete(id);
      toast.success("Curriculum record purged successfully");
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during record purge");
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Registration Surface */}
      <section className="bg-surface p-8 rounded-institutional border border-brick/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brick/5 rounded-full -mr-16 -mt-16" />
        <div className="flex items-center gap-3 mb-8 border-b border-brick/5 pb-4">
          <FiBookOpen className="text-brick text-xl" />
          <h2 className="text-lg font-black text-institutional-primary tracking-tight">
            Curriculum Asset Definition
          </h2>
        </div>

        <form onSubmit={handleCourseSubmit} className="space-y-6">
          <div className="form-grid-institutional">
            {[
              {
                label: "Course Code",
                name: "code",
                placeholder: "e.g. CSC 401",
              },
              { label: "Official Title", name: "title" },
              { label: "Unit Weight", name: "unit" },
              { label: "Semester Cycle", name: "semester" },
              { label: "Enrollment Count", name: "enrollmentCount" },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all font-sans"
                  value={(formData as any)[field.name]}
                  onChange={handleInputChangeForm}
                />
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-brick/5">
            <button
              type="submit"
              className="px-12 py-3.5 bg-brick text-white rounded-institutional text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brick/20 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <FiPlus /> Commit Curriculum Entry
            </button>
          </div>
        </form>
      </section>

      {/* Ledger Surface */}
      <div className="institutional-table-container">
        <div className="p-4 border-b border-brick/10 bg-page/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 max-w-2xl gap-2">
            <div className="relative flex-1 group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brick group-focus-within:scale-110 transition-transform">
                <FiSearch size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by Code or Title..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="text-[10px] font-black uppercase text-institutional-muted tracking-widest bg-brick/5 px-3 py-2 rounded-full border border-brick/10 inline-flex items-center self-start md:self-center">
            {isLoading
              ? "Synchronizing..."
              : `Registry: ${filteredCourses.length} assets`}
          </div>
        </div>

        <table className="institutional-table">
          <thead>
            <tr>
              <th>Internal Code</th>
              <th>Course Title</th>
              <th className="text-center">Units</th>
              <th className="text-center">Cycle</th>
              <th className="text-center">Enrolled</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brick/5">
            {paginatedCourses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-brick/5 transition-colors group"
              >
                {editId === course.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editCourseData.code || ""}
                        onChange={(e) =>
                          setEditCourseData((p) => ({
                            ...p,
                            code: e.target.value,
                          }))
                        }
                        className="w-24 bg-page border border-brick/20 px-2 py-1 rounded text-xs font-bold font-mono"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editCourseData.title || ""}
                        onChange={(e) =>
                          setEditCourseData((p) => ({
                            ...p,
                            title: e.target.value,
                          }))
                        }
                        className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        value={editCourseData.unit || 0}
                        onChange={(e) =>
                          setEditCourseData((p) => ({
                            ...p,
                            unit: parseInt(e.target.value),
                          }))
                        }
                        className="w-12 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        value={editCourseData.semester || 1}
                        onChange={(e) =>
                          setEditCourseData((p) => ({
                            ...p,
                            semester: parseInt(e.target.value),
                          }))
                        }
                        className="w-12 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        value={editCourseData.enrollmentCount || 0}
                        onChange={(e) =>
                          setEditCourseData((p) => ({
                            ...p,
                            enrollmentCount: parseInt(e.target.value),
                          }))
                        }
                        className="w-16 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                      />
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleSave(course.id)}
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
                      {course.code}
                    </td>
                    <td className="text-sm font-bold uppercase tracking-tight max-w-[300px] truncate">
                      {course.title}
                    </td>
                    <td className="text-center font-black opacity-80">
                      {course.unit}{" "}
                      <span className="text-[9px] opacity-40">U</span>
                    </td>
                    <td className="text-center">
                      <span className="status-pill status-pill-info">
                        S{course.semester}
                      </span>
                    </td>
                    <td className="text-center font-mono text-[10px] opacity-60">
                      {course.enrollmentCount}
                    </td>
                    <td className="text-right space-x-1">
                      <button
                        onClick={() => handleEditClick(course)}
                        className="p-2 text-brick opacity-0 group-hover:opacity-100 hover:bg-brick/10 rounded-full transition-all duration-300"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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
                className="px-4 py-2 bg-white border border-brick/10 rounded text-[10px] font-black uppercase disabled:opacity-50 hover:bg-brick/5 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
