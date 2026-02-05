/**
 * Institutional Theme Tokens
 * Orchestrates the standard visual contract for Bells University.
 */

export const COLORS = {
  brick: "#6b2e1e",
  brickDeep: "#4a1f14",
  shinyYellow: "#ffd36b",
  shinyYellowDark: "#ffb800",
  textOnBrand: "#fff7f0",
  muted: "#e7dccf",
  // Academic Status Layers
  success: "#22aa22",
  error: "#ff4444",
  info: "#4a90e2",
  warning: "#ffbb44",
} as const;

export const SIZES = {
  inputPadding: "12px",
  sidebarWidth: "280px",
  headerHeight: "64px",
} as const;

export const THEME_KEY = "lt_theme";

const theme = { COLORS, SIZES, THEME_KEY };
export default theme;
