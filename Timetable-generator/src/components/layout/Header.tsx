import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../services/state/authStore";
import { authService } from "../../services/api/authService";
import { useTheme } from "../../context/ThemeContext";
import {
  FiMenu,
  FiMoon,
  FiSun,
  FiUser,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import bellsLogo from "../../assets/images/bells-logo.png";

interface HeaderProps {
  onMenuToggle: () => void;
}

/**
 * Institutional Header
 * Features: Fixed position, Brick Brown gradient, stays on top.
 */
const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuthStore();
  const { theme, toggle: toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-brick border-b border-brick-deep shadow-lg z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-6">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-institutional hover:bg-white/10 transition-all text-white"
            aria-label="Toggle menu"
          >
            <FiMenu size={20} />
          </button>

          {/* Institutional Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-4 group transition-all"
          >
            <div className="w-10 h-10 bg-white rounded-institutional flex items-center justify-center shadow-lg shadow-black/10 group-hover:rotate-6 transition-all duration-500 overflow-hidden p-1">
              <img
                src={bellsLogo}
                alt="Bells University"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white leading-none">
                Bells University
              </h1>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                Registry Engine
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Theme + User */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-institutional bg-white/10 hover:bg-white/20 transition-all text-white group"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <FiMoon
                size={16}
                className="group-hover:rotate-12 transition-transform"
              />
            ) : (
              <FiSun
                size={16}
                className="group-hover:rotate-45 transition-transform"
              />
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-institutional bg-white/10 hover:bg-white/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                <FiUser className="text-brick-deep" size={14} />
              </div>
              <span className="hidden md:block text-xs font-bold text-white uppercase tracking-widest">
                {user?.username || "Authorized User"}
              </span>
              <FiChevronDown
                className={`text-white/60 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                size={14}
              />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-institutional shadow-xl border border-brick/10 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-brick/10 bg-brick/5">
                    <p className="text-xs font-black uppercase tracking-widest text-brick">
                      {user?.roleCode === "AD"
                        ? "ADMINISTRATOR"
                        : user?.roleCode === "CR"
                          ? "COLLEGE REPR"
                          : user?.roleCode === "DR"
                            ? "DEPT REPR"
                            : "STAFF/USER"}
                    </p>
                    <p className="text-[10px] text-institutional-muted mt-1 uppercase">
                      ID: {user?.username || "SYSTEM"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-brick/5 transition-all text-left group"
                  >
                    <FiLogOut className="text-status-error" size={16} />
                    <span className="text-xs font-bold text-institutional-primary uppercase tracking-widest">
                      Sign Out
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
