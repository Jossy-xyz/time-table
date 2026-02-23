import React, { useState, FormEvent, useEffect } from "react";
import { FiUserPlus, FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import { departmentService } from "./services/api/departmentService";
import { programService } from "./services/api/programService";
import { collegeService } from "./services/api/collegeService";
import { studentService } from "./services/api/studentService";
import { Student, Department, Programme, Centre } from "./types/institutional";

interface StudentFormProps {
  onStudentform?: (val: string) => void;
}

/**
 * Academic Student Enrollment Form
 * Synchronized with Backend DTOs and Scoped by Actor.
 */
export default function StudentForm({ onStudentform }: StudentFormProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    matricNo: "",
    fullName: "",
    level: 100,
    departmentId: undefined,
    collegeId: undefined,
    programme: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Programme[]>([]);
  const [colleges, setColleges] = useState<Centre[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Programme[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depts, progs, clgs] = await Promise.all([
          departmentService.getAll(),
          programService.getAll(),
          collegeService.getAll(),
        ]);
        setDepartments(depts);
        setPrograms(progs);
        setColleges(clgs);
        setFilteredPrograms(progs);
      } catch (error) {
        toast.error("Failed to load institutional metadata");
      }
    };
    fetchData();
  }, []);

  const handleDeptChange = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      departmentId: id,
      programme: "",
    }));
    if (id) {
      setFilteredPrograms(programs.filter((p) => p.departmentId === id));
    } else {
      setFilteredPrograms(programs);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.matricNo ||
      !formData.fullName ||
      !formData.departmentId ||
      !formData.collegeId ||
      !formData.programme
    ) {
      return toast.warn("Verify all mandatory academic fields");
    }

    try {
      await studentService.create(formData);
      toast.success("Student enrollment committed to registry");
      if (onStudentform) onStudentform("");

      setFormData({
        matricNo: "",
        fullName: "",
        level: 100,
        departmentId: undefined,
        collegeId: undefined,
        programme: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Critical failure during enrollment sync");
    }
  };

  return (
    <div className="bg-surface p-8 rounded-institutional shadow-sm border border-brick/10 mb-8 animate-fadeIn">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 mb-6 border-b border-brick/5 pb-4">
          <FiUserPlus className="text-brick text-xl" />
          <h2 className="text-lg font-black text-institutional-primary tracking-tight">
            Academic Enrollment Interface
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Matriculation Number
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.matricNo}
              onChange={(e) =>
                setFormData({ ...formData, matricNo: e.target.value })
              }
              placeholder="e.g. 2020/10001"
              required
            />
          </div>

          <div className="input-group lg:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Full Name (Surname, Firstname Middle)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="e.g. Johnson, Michael Samuel"
              required
            />
          </div>

          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              College/Centre
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all appearance-none"
                value={formData.collegeId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    collegeId: parseInt(e.target.value),
                  })
                }
                required
              >
                <option value="">Select College</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-institutional-muted">
                <FiChevronDown />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Academic Level
            </label>
            <select
              className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all appearance-none"
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: parseInt(e.target.value) })
              }
              required
            >
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
          </div>

          <div className="input-group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Departmental Identifier
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all appearance-none"
                value={formData.departmentId || ""}
                onChange={(e) => handleDeptChange(parseInt(e.target.value))}
                required
              >
                <option value="">Select Department</option>
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

          <div className="input-group lg:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
              Academic Programme
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 focus:border-brick transition-all appearance-none"
                value={formData.programme || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    programme: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Programme</option>
                {filteredPrograms.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-institutional-muted">
                <FiChevronDown />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-brick/5">
          <button
            type="submit"
            className="w-full md:w-auto px-10 py-3 bg-brick text-white rounded-institutional text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-brick/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Authorize Enrollment
          </button>
        </div>
      </form>
    </div>
  );
}
