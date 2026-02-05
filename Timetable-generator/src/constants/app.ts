/**
 * Application constants
 */

export const APP_TITLE = "Timetable Generator";

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  TIMEOUT: 5000,
};

export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  STUDENT: "student",
  COORDINATOR: "coordinator",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const MESSAGES = {
  SUCCESS: {
    CREATED: "Item created successfully in registry",
    UPDATED: "Item record updated successfully",
    DELETED: "Item record purged from registry",
    SAVED: "Administrative changes saved successfully",
  },
  ERROR: {
    NETWORK:
      "Institutional network failure. Verify academic server connection.",
    SERVER:
      "Academic core server error. Please retry following technical audit.",
    UNAUTHORIZED:
      "Unauthorized access detected. Institutional re-authentication required.",
    VALIDATION: "Academic data validation failed. Rectify ledger entries.",
  },
  CONFIRM: {
    DELETE:
      "Determine if this record should be permanently removed from the academic ledger?",
    LOGOUT: "Confirm decommissioning of current academic session?",
  },
} as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const DATE_FORMAT = "MMM DD, YYYY";
export const TIME_FORMAT = "hh:mm A";
