/**
 * ==========================================================================
 * BELLS UNIVERSITY - INSTITUTIONAL DATA CONTRACTS
 * Standardized types for core academic entities.
 * Matched with Backend DTOs.
 * ==========================================================================
 */

export interface Centre {
  id: number;
  code: string;
  name: string;
  type: number;
  state: string;
}

export interface Department {
  id: number;
  collegeId: number;
  code: string;
  name: string;
  // Payload alias for some legacy components
  collegeID?: number; // TODO: Standardize to camelCase in all components
}

export interface Program {
  id: number;
  departmentId: number;
  code: string;
  name: string;
  duration: number;
  totalCompulsoryUnits: number;
  totalRequiredUnits: number;
  minElectiveUnits: number;
  entryRequirements: string;
  // Payload aliases (legacy)
  deptID?: number;
  newCodeID?: string; // Legacy alias?
}

// Alias for Program to match some components
export type Programme = Program;

export interface Staff {
  id: number;
  departmentId: number;
  staffId: string;
  title: string;
  surname: string;
  firstname: string;
  middlename: string;
  statusId: number;
  type: number;
  dutyCount: number;
  specialization: string;
  researchArea: string;
}

export interface Student {
  id: string; // Matched with DTO (matricNo)
  matricNo: string;
  fullName: string;
  departmentId: number;
  collegeId: number;
  programme: string;
  level: number;
  // Legacy fields for form compatibility if needed
  surname?: string;
  firstname?: string;
  middlename?: string;
  startSession?: string;
}

export interface Course {
  id: string | number;
  code: string;
  title: string;
  unit: number;
  semester: number;
  enrollmentCount: number;
}

export interface Venue {
  id: number;
  centreId: number;
  venueCode: string;
  name: string;
  capacity: number;
  type: number;
  preference: number;
  actualCapacity: number;
  inUse: boolean;
}

export interface Registration {
  id: number;
  studentId: number;
  courseId: number;
  session: string;
  semester: number;
  // Payload fields (optional on read)
  matricNo?: string;
  courseCode?: string;
}

export interface StudentSemesterRegistration {
  id: number;
  studentId: number;
  session: string;
  semester: number;
  level: number;
  // Payload fields (optional on read)
  matric_NO?: string; // Explicitly keeping backend naming for payload if needed
  course_Code_List?: string;
}

export interface SlashedCourse {
  id: number;
  code: string;
  type: string;
  sem: string | number;
}

export interface User {
  id: number;
  username: string;
  roleId: number;
  roleCode: string; // 'AD', 'CR', 'DR', 'ST'
  collegeId?: number;
  departmentId?: number;
  department?: Department;
  staffId?: number;
  email?: string;
  password?: string;
}

export interface Constraint {
  id: number;
  name: string;
  description?: string;
  date?: string;
  periodIncE: string;
  periodExcE: string;
  venueIncE: string;
  venueExcE: string;
  periodIncV: string;
  periodExcV: string;
  examWAftE: string;
  examExcE: string;
  examWCoinE: string;
  frontLE: string;
  staffOmit: string; // Formatting: "BUT/001;BUT/002"
  staffPeriodExcl: string; // Formatting: "BUT/001(1,2);BUT/002(4,5)"
}

export interface GeneralSettings {
  id: number;
  description?: string;
  daysPerWeek: number;
  periodsPerDay: number;
  semester: number;
  session: string;
  startDate: string;
  endDate: string;
  examCategory: number;
  campusType: number;
  examLevel: string;
  examWeeks: number;
}

export interface OptimizationSettings {
  id: number;
  displayProgress: boolean;
  optTime: string;
  optCycleCount: number;
  examWeightTime: boolean;
  examWeightCycle: boolean;
}

export interface OutputSettings {
  id: number;
  mixExams: boolean;
  moreSpace: boolean;
  leFullyInV: boolean;
  saveTtCsv: boolean;
  saveTtPdf: boolean;
}

export type ThemeMode = "light" | "dark";

export interface UIState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  activeCollege: number | null;
}

export interface TimetableSlot {
  id: number;
  courseId: number;
  venueId: number;
  dayOfWeek: number;
  periodSlot: number;
  staffId: number;
}

export interface PeriodMapping {
  periodIndex: number; // 0-based
  displayIndex: number; // 1-based
  date: string; // ISO Date string
  dayOfWeek: string;
  weekNumber: number;
  periodOfDay: number;
  isSystemLocked?: boolean;
}

export interface PeriodMappingResponse {
  totalPeriods: number;
  daysPerWeek: number;
  periodsPerDay: number;
  startDate: string;
  endDate: string;
  periods: PeriodMapping[];
}

export interface PeriodExclusionDto {
  id: number;
  generalSettingsId: number;
  name: string;
  description?: string;
  excludedPeriods: number[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface PeriodExclusionRequest {
  name: string;
  excludedPeriods: number[];
  setAsActive: boolean;
}
