import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FiUsers,
  FiBookOpen,
  FiMapPin,
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { StatCard } from "../components/molecules/StatCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/atoms/Card";

/**
 * Institutional Main Dashboard
 * Orchestrates the high-level overview of the academic registry and scheduling system.
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session] = useState("2024/2025");
  const [semester] = useState("Alpha");

  // Authentication guard
  useEffect(() => {
    // Check if we have a user object at all
    if (!user) {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) {
        console.warn("[DASHBOARD] No authenticated user, redirecting to login");
        navigate("/login");
      }
    }
  }, [user, navigate]);

  // Live Stats State
  const [counts, setCounts] = useState({
    students: "...",
    courses: "...",
    venues: "...",
    status: "Synchronizing...",
    statusOk: true,
  });

  const fetchDashboardData = useCallback(async () => {
    const username = user?.username || localStorage.getItem("username");

    // Guard against null, undefined, or string "undefined"
    if (!username || username === "undefined") {
      setCounts((prev) => ({
        ...prev,
        status: "Not Authenticated",
        statusOk: false,
      }));
      return;
    }

    const endpoints = [
      {
        id: "student",
        url: `http://localhost:8080/student/get?username=${username}`,
      },
      {
        id: "course",
        url: `http://localhost:8080/course/get?username=${username}`,
      },
      { id: "venue", url: `http://localhost:8080/venue/get` },
    ];

    try {
      const results = await Promise.all(
        endpoints.map(async (ep) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for aviation-grade responsiveness

          try {
            const headers: Record<string, string> = {
              "X-Actor-Username": username,
            };
            const res = await fetch(ep.url, {
              signal: controller.signal,
              headers,
            });
            clearTimeout(timeoutId);

            if (!res.ok) return { id: ep.id, count: 0, ok: false };
            const data = await res.json();
            return {
              id: ep.id,
              count: Array.isArray(data) ? data.length : 0,
              ok: true,
            };
          } catch (e) {
            console.warn(`Fetch failure for ${ep.id}:`, e);
            return { id: ep.id, count: 0, ok: false };
          }
        }),
      );

      const studentData = results.find((r) => r.id === "student");
      const courseData = results.find((r) => r.id === "course");
      const venueData = results.find((r) => r.id === "venue");

      const allSystemsOk = results.length > 0 && results.every((r) => r.ok);

      setCounts({
        students: studentData?.count.toLocaleString() || "0",
        courses: courseData?.count.toLocaleString() || "0",
        venues: venueData?.count.toLocaleString() || "0",
        status: allSystemsOk ? "Active" : "Offline",
        statusOk: allSystemsOk,
      });
    } catch (err) {
      console.error("Dashboard full sync failure:", err);
      setCounts((prev) => ({ ...prev, status: "Offline", statusOk: false }));
    }
  }, [user?.username]);

  React.useEffect(() => {
    // User state monitoring
  }, [user]);

  React.useEffect(() => {
    fetchDashboardData();
    // Refresh every 30s to keep health status accurate
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const stats = [
    {
      label: "Enrolled Students",
      value: counts.students,
      icon: <FiUsers />,
      trend: { value: 100, label: "Registry Population" },
    },
    {
      label: "Academic Courses",
      value: counts.courses,
      icon: <FiBookOpen />,
      trend: { value: 100, label: "Curriculum Assets" },
    },
    {
      label: "Venue Capacity",
      value: counts.venues,
      icon: <FiMapPin />,
      trend: { value: 100, label: "Infrastructure Ready" },
    },
    {
      label: "Registry Status",
      value: counts.status,
      icon: (
        <FiActivity
          className={
            counts.statusOk
              ? "text-status-success"
              : "text-status-error animate-pulse"
          }
        />
      ),
      trend: {
        value: counts.statusOk ? 100 : -1,
        label: counts.statusOk
          ? "Systems Nominal"
          : "Backend Connection Refused",
      },
    },
  ];

  const recentActivity = [
    {
      type: "success",
      title: "Timetable Grid Refined",
      msg: "Conflict resolution engine completed 2,000 cycles for CMP 400 level.",
      time: "2m ago",
    },
    {
      type: "info",
      title: "New Venue Assets",
      msg: "Auditorium Hall 2 added to the infrastructure infrastructure registry.",
      time: "1h ago",
    },
    {
      type: "warning",
      title: "Constraint Conflict",
      msg: "Overlap detected in MTH 101 proctoring schedule. Manual override required.",
      time: "3h ago",
    },
    {
      type: "success",
      title: "Staff Enrollment",
      msg: "15 new academic personnel records committed from the Faculty Ledger.",
      time: "Yesterday",
    },
  ];

  return (
    <>
      {/* Unified Institutional Sticky Header */}
      <div className="sticky top-16 z-40 bg-page/95 backdrop-blur-md border-b border-brick/10 -mx-6 px-6 pt-8 pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 transition-all shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-[1px] bg-brick/30" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brick">
              System Orchestration Hub
            </h2>
          </div>
          <h1 className="text-3xl font-black text-institutional-primary tracking-tight">
            Greetings,{" "}
            <span className="text-brick">
              {user?.username ||
                localStorage.getItem("username") ||
                "Authorized Admin"}
            </span>
          </h1>
          <p className="text-[11px] text-institutional-secondary font-medium tracking-tight opacity-70">
            Institutional Registry session for {user?.roleCode || "SYSTEM"}
          </p>
        </div>

        <div className="flex gap-4 p-2 bg-brick/5 rounded-institutional border border-brick/10 mb-1">
          <div className="text-right border-r border-brick/20 pr-4">
            <p className="text-[9px] font-black uppercase text-brick tracking-widest leading-none mb-1">
              Session
            </p>
            <p className="text-xs font-bold text-institutional-primary">
              {session}
            </p>
          </div>
          <div className="pl-2 pr-2">
            <p className="text-[9px] font-black uppercase text-brick tracking-widest leading-none mb-1">
              Semester
            </p>
            <p className="text-xs font-bold text-institutional-primary">
              {semester}
            </p>
          </div>
        </div>
      </div>

      <div className="animate-fadeIn space-y-8 pb-12">
        {/* KPI Stats Grid - Using Atomic Molecules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) =>
            i === 3 ? (
              <Link
                to="/settings"
                key={i}
                className="block transition-transform hover:scale-[1.02]"
              >
                <StatCard
                  title={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  trend={stat.trend}
                />
              </Link>
            ) : (
              <StatCard
                key={i}
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
              />
            ),
          )}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: System Status & Activity - Using Atomic Card */}
          <div className="lg:col-span-8">
            <Card className="h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brick/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
              <CardHeader className="border-b border-brick/5 pb-4 mb-4">
                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2 text-brick">
                  <FiActivity /> System Activity Ledger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-5 group items-start">
                    <div
                      className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        act.type === "success"
                          ? "bg-status-success/5 border-status-success/20 text-status-success"
                          : act.type === "warning"
                            ? "bg-status-warning/5 border-status-warning/20 text-status-warning"
                            : "bg-status-info/5 border-status-info/20 text-status-info"
                      }`}
                    >
                      {act.type === "success" ? (
                        <FiCheckCircle size={14} />
                      ) : act.type === "warning" ? (
                        <FiAlertCircle size={14} />
                      ) : (
                        <FiInfo size={14} />
                      )}
                    </div>
                    <div className="flex-1 pb-4 border-b border-brick/5 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-institutional-primary">
                          {act.title}
                        </h4>
                        <span className="text-[10px] font-bold text-institutional-muted uppercase">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-xs text-institutional-secondary leading-relaxed opacity-80">
                        {act.msg}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Quick Actions & Navigation */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-brick p-8 rounded-institutional shadow-xl text-white relative overflow-hidden group hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mb-24 -mr-24 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-60">
                  Engine Hub
                </h3>
                <p className="text-lg font-bold leading-tight tracking-tight">
                  Access the core timetable generation kernel.
                </p>
                <Link
                  to="/timetable"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gold text-brick rounded font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-white transition-all"
                >
                  Orchestration Core <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
