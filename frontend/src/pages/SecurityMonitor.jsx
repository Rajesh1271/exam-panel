import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Eye,
  RefreshCw,
  Trash2,
  Filter,
  Search,
  Users,
  Clock,
  Laptop,
  Maximize2,
  Copy,
  MousePointer,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

export default function SecurityMonitor() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalViolations: 0,
    highRiskStudents: 0,
    warningStudents: 0,
    normalStudents: 0,
    criticalEventsCount: 0
  });
  const [studentSummaries, setStudentSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3300/api/security/monitor", {
        params: {
          eventType: filterType !== "all" ? filterType : undefined,
          riskLevel: filterRisk !== "all" ? filterRisk : undefined
        }
      });
      if (res.data?.success) {
        setLogs(res.data.logs || []);
        setStats(res.data.stats || {});
        setStudentSummaries(res.data.studentSummaries || []);
      }
    } catch (err) {
      console.error("fetchSecurityData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 8000); // Auto-refresh telemetry every 8s
    return () => clearInterval(interval);
  }, [filterType, filterRisk]);

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all recorded security violations?")) return;
    try {
      await axios.delete("http://localhost:3300/api/security/clear");
      fetchSecurityData();
    } catch (err) {
      alert("Failed to clear logs.");
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case "tab_switch":
        return { label: "Tab Switched", bg: "bg-amber-500/10 text-amber-300 border-amber-500/30" };
      case "fullscreen_exit":
        return { label: "Fullscreen Exited", bg: "bg-rose-500/10 text-rose-300 border-rose-500/30" };
      case "copy_attempt":
        return { label: "Copy Attempt", bg: "bg-purple-500/10 text-purple-300 border-purple-500/30" };
      case "paste_attempt":
        return { label: "Paste Attempt", bg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" };
      case "right_click":
        return { label: "Right-Click Blocked", bg: "bg-blue-500/10 text-blue-300 border-blue-500/30" };
      case "multiple_refresh":
        return { label: "Multiple Refreshes", bg: "bg-orange-500/10 text-orange-300 border-orange-500/30" };
      case "inactivity":
        return { label: "Unusual Inactivity", bg: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" };
      case "multiple_login":
        return { label: "Multiple Logins", bg: "bg-red-500/20 text-red-300 border-red-500/50" };
      default:
        return { label: type?.replace("_", " "), bg: "bg-slate-500/10 text-slate-300 border-slate-500/30" };
    }
  };

  const getRiskPill = (level) => {
    switch (level) {
      case "high_risk":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            🔴 High Risk
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            🟡 Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            🟢 Normal
          </span>
        );
    }
  };

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      (l.studentName || "").toLowerCase().includes(q) ||
      (l.examTitle || "").toLowerCase().includes(q) ||
      (l.details || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} p-6 md:p-8 space-y-8`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl shadow-lg shadow-rose-500/20 text-white">
                <ShieldAlert size={24} />
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Smart Anti-Cheating & Security Monitor
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Real-time violation tracking, behavioral heuristics, and live risk level classification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSecurityData}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh Telemetry</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <Trash2 size={14} />
              <span>Clear Logs</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Violations */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-white/10 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Security Triggers</span>
              <ShieldAlert size={18} className="text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.totalViolations || 0}</div>
            <p className="text-[11px] text-slate-400">Events caught by active AI monitors</p>
          </div>

          {/* High Risk Students */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900/60 border border-rose-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-rose-300 text-xs font-bold uppercase tracking-wider">
              <span>🔴 High Risk Students</span>
              <AlertTriangle size={18} className="text-rose-400" />
            </div>
            <div className="text-3xl font-black text-rose-400">{stats.highRiskStudents || 0}</div>
            <p className="text-[11px] text-rose-300/80">Require immediate instructor review</p>
          </div>

          {/* Warning Students */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900/60 border border-amber-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span>🟡 Warning Flags</span>
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{stats.warningStudents || 0}</div>
            <p className="text-[11px] text-amber-300/80">Moderate suspicious activity</p>
          </div>

          {/* Normal Students */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>🟢 Normal Sessions</span>
              <ShieldCheck size={18} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{stats.normalStudents || 0}</div>
            <p className="text-[11px] text-emerald-300/80">Zero to minimal infractions</p>
          </div>
        </div>

        {/* Student Risk Cards (Summary per active test-taker) */}
        {studentSummaries.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              Active Student Risk Assessment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentSummaries.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-teal-500/40 transition space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-teal-300 ring-2 ring-white/10">
                        {s.studentName?.[0] || "S"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[130px]">
                          {s.studentName}
                        </h4>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {s.studentEmail || s.examTitle}
                        </span>
                      </div>
                    </div>

                    {getRiskPill(s.riskLevel)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Total Triggers:</span>
                      <span className="font-bold text-white">{s.totalViolations}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Latest Event:</span>
                      <span className="font-bold text-amber-300 capitalize">{s.latestEvent?.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Violation Stream */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Live Event Log Stream</h3>
              <p className="text-xs text-slate-400">Captured anti-cheat events stored permanently in MongoDB</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or exam..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-teal-400 w-56"
                />
              </div>

              {/* Event Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-800 text-white text-xs py-2 px-3 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-400"
              >
                <option value="all">All Events</option>
                <option value="tab_switch">Tab Switch</option>
                <option value="fullscreen_exit">Fullscreen Exit</option>
                <option value="copy_attempt">Copy Attempt</option>
                <option value="paste_attempt">Paste Attempt</option>
                <option value="right_click">Right Click</option>
                <option value="multiple_refresh">Multiple Refreshes</option>
                <option value="inactivity">Inactivity</option>
                <option value="multiple_login">Multiple Login</option>
              </select>

              {/* Risk Filter */}
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="bg-slate-800 text-white text-xs py-2 px-3 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-400"
              >
                <option value="all">All Risk Tiers</option>
                <option value="high_risk">🔴 High Risk</option>
                <option value="warning">🟡 Warning</option>
                <option value="normal">🟢 Normal</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Student</th>
                  <th className="py-3.5 px-4 font-bold">Exam</th>
                  <th className="py-3.5 px-4 font-bold">Event Type</th>
                  <th className="py-3.5 px-4 font-bold">Details</th>
                  <th className="py-3.5 px-4 font-bold">Risk Status</th>
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const badge = getEventBadge(log.eventType);
                    return (
                      <tr key={log._id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>{log.studentName}</div>
                          <span className="text-[10px] text-slate-500">{log.studentEmail}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 truncate max-w-[160px]">
                          {log.examTitle}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {log.details}
                        </td>
                        <td className="py-3 px-4">
                          {getRiskPill(log.riskLevel)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      <ShieldCheck size={36} className="mx-auto mb-2 text-emerald-400/60" />
                      No security infractions recorded. System is 100% clean.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
