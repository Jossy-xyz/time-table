import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiPieChart,
  FiUsers,
  FiBookOpen,
  FiActivity,
  FiMapPin,
  FiCalendar,
  FiSettings,
  FiTrello,
} from "react-icons/fi";
import { useAuthStore } from "../../services/state/authStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Institutional Sidebar
 * Features: High-contrast markers, premium typography, and disciplined navigation categories.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Role Check: Venues accessible by AD(1) and CR(2)
  const canAccessVenues =
    user?.roleCode === "AD" ||
    user?.roleCode === "CR" ||
    user?.roleId === 1 ||
    user?.roleId === 2;

  const primaryNavigation = [
    { label: "Overview", path: "/dashboard", icon: <FiPieChart /> },
    { label: "Student Registry", path: "/students", icon: <FiUsers /> },
    { label: "Academic Staff", path: "/staff", icon: <FiActivity /> },
    { label: "Curriculum Assets", path: "/courses", icon: <FiBookOpen /> },
    ...(canAccessVenues
      ? [{ label: "Physical Venues", path: "/venues", icon: <FiMapPin /> }]
      : []),
  ];

  const operationalNavigation = [
    { label: "Timetable Grid", path: "/timetable", icon: <FiCalendar /> },
    { label: "System Calibration", path: "/settings", icon: <FiSettings /> },
  ];

  const renderLink = (item: {
    label: string;
    path: string;
    icon: React.ReactNode;
  }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-4 px-6 py-3 rounded-institutional font-bold transition-all duration-300 group relative ${
          isActive
            ? "bg-brick text-white shadow-lg shadow-brick/25"
            : "text-institutional-secondary hover:bg-brick/5 hover:text-brick"
        }`}
        onClick={onClose}
        aria-current={isActive ? "page" : undefined}
      >
        <span
          className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-brick/60 group-hover:text-brick"}`}
        >
          {item.icon}
        </span>
        <span className="text-xs uppercase tracking-widest">{item.label}</span>
        {isActive && (
          <div className="absolute left-0 w-1.5 h-6 bg-gold rounded-r-full shadow-[2px_0_8px_rgba(255,211,107,0.8)]" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar surface - Fixed position, stays in place on scroll */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-64px)] w-72 bg-surface border-r border-brick/10 transform transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Scrollable content with reduced padding */}
        <div className="flex flex-col h-full py-6 custom-scrollbar overflow-y-auto">
          {/* Principal Category */}
          <div className="space-y-6">
            <div className="px-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brick opacity-40 mb-4">
                Registry Core
              </p>
              <nav className="space-y-1">
                {primaryNavigation.map(renderLink)}
              </nav>
            </div>

            {/* Operational Category */}
            <div className="px-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brick opacity-40 mb-4">
                Operations Hub
              </p>
              <nav className="space-y-1">
                {operationalNavigation.map(renderLink)}
              </nav>
            </div>
          </div>

          {/* Institutional Branding Badge */}
          <div className="mt-auto px-6 pb-2">
            <div className="p-4 bg-page rounded-institutional border border-brick/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brick/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrello className="text-brick" size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-brick">
                    {user?.department?.name || "Bells Registry"}
                  </span>
                </div>
                <div className="space-y-1 opacity-80">
                  <p className="text-[9px] font-bold text-institutional-secondary">
                    Session:{" "}
                    <span className="text-institutional-primary">
                      2024/2025
                    </span>
                  </p>
                  <p className="text-[9px] font-bold text-institutional-secondary">
                    Semester:{" "}
                    <span className="text-institutional-primary text-[8px] uppercase tracking-tighter">
                      1st (Alpha)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
