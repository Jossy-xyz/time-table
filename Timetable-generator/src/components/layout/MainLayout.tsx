import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main Institutional Layout
 * Enforces the brand background and disciplined spacing.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page flex flex-col transition-colors duration-300 antialiased overflow-x-hidden">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content area with top padding for fixed header */}
      <div className="flex flex-1 relative pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 md:ml-72" role="main">
          <div className="max-w-[1600px] mx-auto px-6 pb-12 pt-0">
            {children}
          </div>
        </main>
      </div>

      {/* Institutional Footer (Subtle) */}
      <footer className="py-6 px-8 border-t border-brick/10 bg-surface/50 backdrop-blur-sm md:ml-72">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-institutional-muted text-xs font-medium">
          <p>
            © 2026 Bells University of Technology. All Academic Rights Reserved.
          </p>
          <div className="flex gap-6 uppercase tracking-widest text-[10px]">
            <span>School of Technology</span>
            <span className="text-brick/40">|</span>
            <span>Academic Infrastructure v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
