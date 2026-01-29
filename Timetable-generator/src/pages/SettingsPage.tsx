import React, { useState, FormEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiInfo,
  FiDownload,
  FiDatabase,
  FiSettings,
  FiLock,
  FiCheckCircle,
  FiChevronRight,
  FiActivity,
  FiWifi,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface OptimizationParameter {
  checked: boolean;
  value: string;
}

interface OptimizationAlgo {
  checked: boolean;
  parameters: any;
}

const TABS = [
  { id: "constraint", label: "Constraint Settings", icon: "🔒" },
  { id: "examination", label: "Examination Settings", icon: "📝" },
  { id: "output", label: "Output Settings", icon: "🖨️" },
  { id: "optimization", label: "Optimization Settings", icon: "⚙️" },
  { id: "health", label: "Health & Integrity", icon: "🏥" },
] as const;

const CONSTRAINT_LIST = [
  {
    label: "Period Inclusive Exams",
    key: "periodInclusive",
    description: "Exams that must be scheduled in specific time periods",
  },
  {
    label: "Period Exclusive Exams",
    key: "periodExclusive",
    description: "Exams that cannot be scheduled in certain periods",
  },
  {
    label: "Period Exclusive Venues",
    key: "periodExVen",
    description: "Venues that cannot be used in specific periods",
  },
  {
    label: "Venue Inclusive Exams",
    key: "VenInc",
    description: "Exams that must use certain venues",
  },
  {
    label: "Exams After Exams",
    key: "ExamAfEx",
    description: "Specify exam sequences",
  },
  {
    label: "Exams with Coincidence",
    key: "ExamWCo",
    description: "Exams that must occur simultaneously",
  },
  {
    label: "Exam Exclusive Exams",
    key: "EXexEX",
    description: "Exams that cannot occur together",
  },
  {
    label: "Front Loaded Exams",
    key: "FroLoadedEx",
    description: "Important exams scheduled earlier",
  },
];

const OPTIMIZATION_OPTS = [
  {
    key: "tabuSearch",
    label: "Tabu Search",
    description: "Avoids revisiting solutions to escape local optima",
  },
  {
    key: "geneticAlgorithm",
    label: "Genetic Algorithm",
    description: "Evolutionary approach using selection and mutation",
  },
  {
    key: "Hybrid",
    label: "Hybrid (TS-GA)",
    description: "Combines Tabu Search and Genetic Algorithm",
  },
];

/**
 * Institutional Configuration Page
 * Refactored from the SettingsPanel modal to a first-class page.
 * Enforces institutional design and professional calibration surfaces.
 */
const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("constraint");
  const [constraints, setConstraints] = useState<
    Record<string, { checked: boolean; values: string[] }>
  >({});
  const [optimize, setOptimize] = useState<Record<string, OptimizationAlgo>>({
    tabuSearch: { checked: false, parameters: {} },
    geneticAlgorithm: {
      checked: false,
      parameters: {
        population: { checked: false, value: "" },
        Operationcount: { checked: false, value: "" },
        CrossOverType: { checked: false, value: "" },
        TournamentType: { checked: false, value: "" },
        adaptAll: false,
      },
    },
    Hybrid: { checked: false, parameters: {} },
  });

  // Examination State
  const [examPolicy, setExamPolicy] = useState("");
  const [maxExamL, setMaxExamL] = useState("");
  const [minExamL, setMinExamL] = useState("");
  const [examLevel, setExamLevel] = useState("");

  // Output State
  const [mixExams, setMixExams] = useState(false);
  const [moreSpace, setMoreSpace] = useState(false);
  const [largeExam, setLargeExam] = useState(false);
  const [halfSpace, setHalfSpace] = useState(false);
  const [skipWeek, setSkipWeek] = useState(false);
  const [sitting, setSitting] = useState(false);
  const [studentStaff, setStudentStaff] = useState("");
  const [staffInv, setStaffInv] = useState("");
  const [staffRandom, setStaffRandom] = useState(false);
  const [staffUpdate, setStaffUpdate] = useState(false);
  const [saveTTc, setSaveTTc] = useState(false);
  const [saveTTp, setSaveTTp] = useState(false);

  // General Optimization State
  const [displayProg, setDisplayProg] = useState(false);
  const [optTime, setOptTime] = useState("");
  const [optCount, setOptCount] = useState("");

  // Health & Heartbeat State
  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [checkingHealth, setCheckingHealth] = useState(false);

  const fetchHealth = async () => {
    setCheckingHealth(true);
    const endpoints = [
      {
        id: "staff",
        url: "http://localhost:8080/staff/get",
        name: "Personnel Ledger",
      },
      {
        id: "student",
        url: "http://localhost:8080/student/get",
        name: "Student Registry",
      },
      {
        id: "course",
        url: "http://localhost:8080/course/get",
        name: "Curriculum Assets",
      },
      {
        id: "venue",
        url: "http://localhost:8080/venue/get",
        name: "Infrastructure Portfolio",
      },
    ];

    const results: Record<string, any> = {};
    const username = localStorage.getItem("username") || "admin";

    for (const ep of endpoints) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const url =
          ep.id === "venue" ? ep.url : `${ep.url}?username=${username}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await res.json();
        results[ep.id] = {
          status: res.ok ? "Connected" : "Offline",
          ok: res.ok,
          name: ep.name,
          count: Array.isArray(data) ? data.length : 0,
        };
      } catch (e) {
        console.error(`Health check failed for ${ep.id}`, e);
        results[ep.id] = {
          status: "Offline",
          ok: false,
          name: ep.name,
          count: 0,
        };
      }
    }
    setHealthData(results);
    setCheckingHealth(false);
    toast.info("Institutional health audit complete");
  };

  const handleConstraintCheckbox = (key: string) => {
    setConstraints((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        checked: !prev[key]?.checked,
        values: prev[key]?.values || [""],
      },
    }));
  };

  const handleOptimizationToggle = (key: string) => {
    setOptimize((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        checked: !prev[key].checked,
      },
    }));
  };

  const handleParamToggle = (algoKey: string, paramKey: string) => {
    setOptimize((prev) => {
      const algo = prev[algoKey];
      if (paramKey === "adaptAll") {
        const newAdaptValue = !algo.parameters.adaptAll;
        const updatedParams = Object.fromEntries(
          Object.keys(algo.parameters).map((p) => {
            const param = algo.parameters[p];
            if (typeof param === "object")
              return [p, { ...param, checked: newAdaptValue }];
            return [p, newAdaptValue];
          }),
        );
        return { ...prev, [algoKey]: { ...algo, parameters: updatedParams } };
      }
      const param = algo.parameters[paramKey];
      return {
        ...prev,
        [algoKey]: {
          ...algo,
          parameters: {
            ...algo.parameters,
            [paramKey]:
              typeof param === "object"
                ? { ...param, checked: !param.checked }
                : !param,
          },
        },
      };
    });
  };

  const handleParamValueChange = (
    algoKey: string,
    paramKey: string,
    newValue: string,
  ) => {
    setOptimize((prev) => {
      const algo = prev[algoKey];
      return {
        ...prev,
        [algoKey]: {
          ...algo,
          parameters: {
            ...algo.parameters,
            [paramKey]: { ...algo.parameters[paramKey], value: newValue },
          },
        },
      };
    });
  };

  const handleConstraintInputChange = (
    key: string,
    value: string,
    index: number,
  ) => {
    setConstraints((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        values: prev[key]?.values?.map((v, i) => (i === index ? value : v)) || [
          value,
        ],
      },
    }));
  };

  const addMoreConstraints = (key: string) => {
    setConstraints((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        values: [...(prev[key]?.values || []), ""],
      },
    }));
  };

  const saveConstraintToDB = async (
    name: string,
    type: string,
    details: string,
  ) => {
    try {
      const res = await fetch("http://localhost:8080/constraint/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, details }),
      });
      if (res.ok)
        toast.success(`Constraint "${type}" committed to academic ledger`);
      else toast.error("Institutional constraint sync failed");
    } catch (error) {
      toast.error("Critical failure during constraint save");
    }
  };

  const saveExamSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/examtab/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_policy: examPolicy,
          max_examl: maxExamL,
          min_examl: minExamL,
          exam_level_high_limit: examLevel,
        }),
      });
      if (res.ok) toast.success("Academic examination boundaries established");
      else toast.error("Boundary synchronization failed");
    } catch (error) {
      toast.error("Critical failure during exam setting save");
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-page/95 backdrop-blur-sm border-b border-brick/10 pb-2 flex justify-between transition-all">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-institutional-primary tracking-tight">
            System Calibration
          </h1>
          <p className="text-[10px] text-institutional-secondary font-medium italic opacity-70">
            Configuration Core • Institutional Parameter Orchestration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Navigation Column */}
        <div className="lg:col-span-1 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-institutional border transition-all ${
                activeTab === tab.id
                  ? "bg-brick text-white border-brick shadow-lg shadow-brick/20"
                  : "bg-surface text-institutional-primary border-brick/5 hover:border-brick/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-black uppercase tracking-widest">
                  {tab.label}
                </span>
              </div>
              <FiChevronRight
                className={`transition-transform ${activeTab === tab.id ? "rotate-90" : ""}`}
              />
            </button>
          ))}
        </div>

        {/* Dynamic Content Column */}
        <div className="lg:col-span-3 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-surface p-6 rounded-institutional border border-brick/10 shadow-sm"
            >
              {activeTab === "constraint" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiLock className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Institutional Constraints
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CONSTRAINT_LIST.map((item) => (
                      <div
                        key={item.key}
                        className="p-4 bg-page/50 border border-brick/5 rounded hover:border-brick/20 transition-all flex flex-col"
                      >
                        <label className="flex items-center gap-3 cursor-pointer group mb-4">
                          <input
                            type="checkbox"
                            checked={constraints[item.key]?.checked || false}
                            onChange={() => handleConstraintCheckbox(item.key)}
                            className="w-4 h-4 accent-brick"
                          />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-wider text-institutional-primary">
                              {item.label}
                            </span>
                            <span className="text-[9px] font-medium text-institutional-muted italic">
                              {item.description}
                            </span>
                          </div>
                        </label>
                        {constraints[item.key]?.checked && (
                          <div className="space-y-2 mt-2 animate-fadeIn">
                            {constraints[item.key].values.map((val, idx) => (
                              <input
                                key={idx}
                                type="text"
                                className="w-full bg-surface border border-brick/10 px-3 py-2 rounded text-[11px] font-bold"
                                value={val}
                                onChange={(e) =>
                                  handleConstraintInputChange(
                                    item.key,
                                    e.target.value,
                                    idx,
                                  )
                                }
                                placeholder="Enter parameter..."
                              />
                            ))}
                            <button
                              onClick={() => addMoreConstraints(item.key)}
                              className="w-full py-2 bg-brick text-white text-[10px] font-black uppercase tracking-widest rounded transition-transform active:scale-95 shadow-md shadow-brick/20"
                            >
                              Commit Constraint
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "examination" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiCheckCircle className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Academic Boundaries
                    </h2>
                  </div>
                  <form
                    onSubmit={saveExamSettings}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Schedule Policy Architecture
                      </label>
                      <input
                        type="text"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={examPolicy}
                        onChange={(e) => setExamPolicy(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted mb-2">
                        Max Capacity Tier
                      </label>
                      <input
                        type="number"
                        className="w-full bg-page border border-brick/10 px-4 py-3 rounded font-bold text-sm"
                        value={maxExamL}
                        onChange={(e) => setMaxExamL(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 col-span-2">
                      <button
                        type="submit"
                        className="px-10 py-3 bg-brick text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-brick/20 hover:scale-105 transition-all"
                      >
                        Authorize Parameters
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "output" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiDownload className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Output Projections
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        label: "Deterministic Venue Mixing",
                        checked: mixExams,
                        setter: setMixExams,
                      },
                      {
                        label: "Global Space Optimization",
                        checked: moreSpace,
                        setter: setMoreSpace,
                      },
                      {
                        label: "Buffer Management (50%)",
                        checked: halfSpace,
                        setter: setHalfSpace,
                      },
                      {
                        label: "Skip Week Protocol",
                        checked: skipWeek,
                        setter: setSkipWeek,
                      },
                    ].map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-center justify-between p-3 bg-page/50 rounded border border-brick/5 cursor-pointer hover:border-brick/10"
                      >
                        <span className="text-xs font-bold text-institutional-primary">
                          {opt.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={opt.checked}
                          onChange={(e) => opt.setter(e.target.checked)}
                          className="w-4 h-4 accent-brick"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "optimization" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-brick/5 pb-3">
                    <FiSettings className="text-brick text-lg" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                      Mathematical Orchestration
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {OPTIMIZATION_OPTS.map((algo) => (
                      <div
                        key={algo.key}
                        className="p-5 bg-page/50 rounded border border-brick/10"
                      >
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={optimize[algo.key].checked}
                            onChange={() => handleOptimizationToggle(algo.key)}
                            className="w-5 h-5 accent-brick"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-widest text-institutional-primary">
                              {algo.label}
                            </span>
                            <span className="text-[10px] font-medium text-institutional-muted italic">
                              {algo.description}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "health" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-brick/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brick/5 rounded-full flex items-center justify-center">
                        <FiActivity className="text-brick" size={14} />
                      </div>
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-brick">
                          System Connectivity & Health
                        </h2>
                        <p className="text-[9px] text-institutional-muted font-bold tracking-tight">
                          Real-time heartbeat monitor for academic services
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={fetchHealth}
                      disabled={checkingHealth}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-institutional border text-[10px] font-black uppercase tracking-widest transition-all ${
                        checkingHealth
                          ? "bg-brick/5 text-brick opacity-50 cursor-not-allowed"
                          : "bg-brick text-white hover:bg-brick-deep shadow-lg shadow-brick/20"
                      }`}
                    >
                      <FiRefreshCw
                        className={checkingHealth ? "animate-spin" : ""}
                      />
                      {checkingHealth ? "Auditing..." : "Execute Pulse Check"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Endpoint Status */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-institutional-muted pl-1">
                        Service Heartbeats
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(healthData).map(
                          ([id, data]: [string, any]) => (
                            <div
                              key={id}
                              className="flex items-center justify-between p-3 bg-page/50 border border-brick/5 rounded-institutional group hover:border-brick/20 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`p-2 rounded-full ${data.ok ? "bg-status-success/10 text-status-success" : "bg-status-error/10 text-status-error"}`}
                                >
                                  <FiWifi size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-institutional-primary">
                                    {data.name}
                                  </p>
                                  <p className="text-[9px] text-institutional-muted uppercase font-black">
                                    {id} endpoint
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${data.ok ? "bg-status-success text-white" : "bg-status-error text-white"}`}
                                >
                                  {data.status}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                        {Object.keys(healthData).length === 0 && (
                          <div className="py-12 text-center border-2 border-dashed border-brick/5 rounded-institutional opacity-40 italic text-xs">
                            Execute pulse check to verify connectivity.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Registry Insights */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-institutional-muted pl-1">
                        Registry Population
                      </h3>
                      <div className="bg-brick/5 p-5 rounded-institutional border border-brick/10 relative overflow-hidden">
                        <FiDatabase className="absolute -right-4 -bottom-4 text-brick/10 w-20 h-20 rotate-12" />
                        <div className="grid grid-cols-2 gap-3 relative z-10">
                          {Object.entries(healthData).map(
                            ([id, data]: [string, any]) => (
                              <div
                                key={id}
                                className={`p-4 rounded border shadow-sm transition-all ${data.count > 0 ? "bg-transparent border-brick/10" : "bg-status-warning/5 border-status-warning/20"}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-[9px] font-black uppercase text-brick/60">
                                    {id}
                                  </p>
                                  {data.count === 0 && data.ok && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-status-warning/20 text-status-warning rounded uppercase">
                                      System Empty
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-2xl font-black leading-none ${data.count > 0 ? "text-institutional-primary" : "text-institutional-muted"}`}
                                >
                                  {data.count ?? 0}
                                </p>
                                <p className="text-[8px] font-bold text-institutional-muted uppercase mt-1">
                                  {data.ok ? "Verified Records" : "Sync Failed"}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                        {Object.keys(healthData).length === 0 && (
                          <div className="text-center py-6 opacity-30 text-xs font-bold italic">
                            Awaiting registry data...
                          </div>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-gold/5 border border-gold/20 rounded-institutional">
                        <div className="flex items-center gap-3 mb-2">
                          <FiZap className="text-gold-deep" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-brick-deep">
                            Institutional Readiness
                          </p>
                        </div>
                        <p className="text-[10px] font-bold text-institutional-secondary leading-relaxed opacity-80">
                          System requires at least 1 record in each core
                          registry (Staff, Courses, Venues) to perform
                          intelligent orchestration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
