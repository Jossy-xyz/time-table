/**
 * College Representation System
 * Provides visual identification for Bells University colleges.
 */

export interface CollegeInfo {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  accentColor: string;
  description: string;
}

export const COLLEGES: Record<string, CollegeInfo> = {
  SCIENCES: {
    id: "sciences",
    name: "College of Natural & Applied Sciences",
    shortName: "Sciences",
    icon: "🔬",
    accentColor: "#4CAF50",
    description: "Physics, Chemistry, Biology, Mathematics",
  },
  ENGINEERING: {
    id: "engineering",
    name: "College of Engineering",
    shortName: "Engineering",
    icon: "⚙️",
    accentColor: "#2196F3",
    description: "Software, Civil, Mechanical, Electrical",
  },
  FOOD_TECH: {
    id: "food-tech",
    name: "College of Food Technology",
    shortName: "Food Technology",
    icon: "🍲",
    accentColor: "#FF9800",
    description: "Nutrition, Food Science, Culinary",
  },
  MANAGEMENT: {
    id: "management",
    name: "College of Management Sciences",
    shortName: "Management",
    icon: "💼",
    accentColor: "#9C27B0",
    description: "Business, Administration, Economics",
  },
  ENVIRONMENTAL: {
    id: "environmental",
    name: "College of Environmental Sciences",
    shortName: "Environmental",
    icon: "🏙️",
    accentColor: "#1252F3",
    description: "Architecture, Building Technology, Estate Management",
  },
};

export const getCollegeById = (id: string): CollegeInfo | undefined => {
  return Object.values(COLLEGES).find((college) => college.id === id);
};

export const getAllColleges = (): CollegeInfo[] => {
  return Object.values(COLLEGES);
};

export const applyCollegeAccent = (collegeId: string) => {
  const college = getCollegeById(collegeId);
  if (!college) return null;

  return {
    accentColor: college.accentColor,
    cssVariable: `--college-accent-${college.id}`,
    backgroundTint: `${college.accentColor}12`,
    borderTint: `${college.accentColor}33`,
  };
};
