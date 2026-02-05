import React from "react";
import StaffList from "../StaffList";

/**
 * Institutional Staff Registry Page
 * Orchestrates the enrollment and ledger management for academic personnel.
 */
const StaffPage: React.FC = () => {
  return (
    <>
      {/* Unified Institutional Sticky Header */}
      <div className="sticky top-16 z-40 bg-page/95 backdrop-blur-md border-b border-brick/10 -mx-6 px-6 pt-8 pb-4 mb-8 flex justify-between items-end transition-all shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-[1px] bg-brick/30" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brick">
              Personnel Management Core
            </h2>
          </div>
          <h1 className="text-3xl font-black text-institutional-primary tracking-tight">
            Academic Personnel
          </h1>
          <p className="text-[11px] text-institutional-secondary font-medium italic opacity-70">
            Faculty Ledger • Human Resource Management
          </p>
        </div>

        <div className="text-right hidden md:block pb-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brick">
            Bells University
          </p>
          <p className="text-[10px] font-bold text-institutional-muted">
            Technology & Innovation
          </p>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <StaffList />
        </section>
      </div>
    </>
  );
};

export default StaffPage;
