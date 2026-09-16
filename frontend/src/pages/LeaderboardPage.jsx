import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trophy,
  Award,
  Medal,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Target,
  BarChart3,
  Flame,
  CheckCircle2
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import TeacherSidebar from "../components/TeacherSidebar";
import StudentSidebar from "../components/StudentSidebar";

export default function LeaderboardPage() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("all");
  const [leaderboard, setLeaderboard] = useState([]);
  const [rankingsEnabled, setRankingsEnabled] = useState(true);
  const [examTitle, setExamTitle] = useState("All Examinations");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toggling, setToggling] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Determine current user role for appropriate sidebar
  let userRole = "student";
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    userRole = u.role || localStorage.getItem("role") || "student";
  } catch (e) {}

  const fetchExams = async () => {
    try {
      const res = await axios.get("http://localhost:3300/api/exams");
      if (Array.isArray(res.data)) {
        setExams(res.data);
      }
    } catch (err) {
      console.error("fetchExams error:", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3300/api/results/leaderboard", {
        params: { examId: selectedExamId !== "all" ? selectedExamId : undefined }
      });
      if (res.data?.success) {
        setLeaderboard(res.data.leaderboard || []);
        setRankingsEnabled(res.data.rankingsEnabled !== false);
        setExamTitle(res.data.examTitle || "All Examinations");
      }
    } catch (err) {
      console.error("fetchLeaderboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedExamId]);

  const handleToggleRankings = async () => {
    if (selectedExamId === "all") {
      alert("Please select a specific exam to toggle its leaderboard settings.");
      return;
    }
    setToggling(true);
    try {
      const res = await axios.put(`http://localhost:3300/api/results/exam/${selectedExamId}/toggle-rankings`, {
        enableRankings: !rankingsEnabled
      });
      if (res.data?.success) {
        setRankingsEnabled(res.data.exam.enableRankings);
        fetchLeaderboard();
      }
    } catch (err) {
      alert("Failed to toggle rankings.");
    } finally {
      setToggling(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter((item) =>
    (item.studentName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  const renderSidebar = () => {
    if (userRole === "admin") return <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />;
    if (userRole === "teacher") return <TeacherSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />;
    return <StudentSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />;
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {renderSidebar()}

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} p-6 md:p-8 space-y-8`}>
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl shadow-lg shadow-amber-500/20 text-slate-950 font-black">
                <Trophy size={26} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Smart Examination Leaderboard
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track accuracy, score metrics, and top student rankings
                </p>
              </div>
            </div>
          </div>

          {/* Exam Selector & Admin/Teacher Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Examinations (Overall)</option>
              {exams.map((ex) => (
                <option key={ex._id || ex.id} value={ex._id || ex.id}>
                  {ex.title || ex.examname}
                </option>
              ))}
            </select>

            {/* Toggle Rankings Button for Instructor/Admin */}
            {(userRole === "admin" || userRole === "teacher") && selectedExamId !== "all" && (
              <button
                onClick={handleToggleRankings}
                disabled={toggling}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                  rankingsEnabled
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
                title="Toggle ranking visibility for formal/practice exams"
              >
                {rankingsEnabled ? (
                  <>
                    <ToggleRight size={18} className="text-amber-400" />
                    <span>Rankings: Enabled (Practice)</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={18} className="text-slate-400" />
                    <span>Rankings: Hidden (Formal)</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={fetchLeaderboard}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* If rankings are disabled by instructor for a formal exam */}
        {!rankingsEnabled ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-4 shadow-2xl">
            <div className="p-4 bg-slate-800 inline-block rounded-full text-amber-400 mb-2 ring-4 ring-amber-400/10">
              <Lock size={36} />
            </div>
            <h2 className="text-2xl font-black text-white">Rankings Are Disabled for This Exam</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              The instructor has marked this as a formal confidential examination. Public rankings and score comparisons are hidden.
            </p>
          </div>
        ) : (
          <>
            {/* Podium Showcase (Top 3 Performers) */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                {/* 🥈 2nd Place */}
                {top2 && (
                  <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-700/60 shadow-xl flex flex-col items-center text-center space-y-3 relative group hover:scale-[1.02] transition">
                    <span className="text-xs font-black text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-600">
                      🥈 2ND PLACE
                    </span>
                    <div className="relative">
                      <img
                        src={top2.studentAvatar}
                        alt={top2.studentName}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-400/60 shadow-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white truncate max-w-[180px]">
                        {top2.studentName}
                      </h3>
                      <span className="text-xs text-slate-400">{top2.studentEmail || "Student"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-white/5 text-xs">
                      <div className="bg-slate-950/60 p-2.5 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Score</span>
                        <span className="text-base font-black text-white">{top2.percentage}%</span>
                      </div>
                      <div className="bg-slate-950/60 p-2.5 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
                        <span className="text-base font-black text-cyan-400">{top2.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🥇 1st Place (Champion) */}
                {top1 && (
                  <div className="p-7 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-400/50 shadow-2xl shadow-amber-500/10 flex flex-col items-center text-center space-y-3 relative -translate-y-2 group hover:scale-[1.03] transition">
                    <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-500/40 flex items-center gap-1.5 shadow-md">
                      <Flame size={14} className="text-amber-400 animate-bounce" />
                      🥇 1ST PLACE CHAMPION
                    </span>
                    <div className="relative">
                      <img
                        src={top1.studentAvatar}
                        alt={top1.studentName}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-2xl"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white truncate max-w-[200px]">
                        {top1.studentName}
                      </h3>
                      <span className="text-xs text-amber-300 font-medium">{top1.studentEmail || "Top Scholar"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full pt-3 border-t border-amber-500/20 text-xs">
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/20">
                        <span className="text-amber-300/70 block text-[10px] uppercase font-black">Score</span>
                        <span className="text-xl font-black text-white">{top1.percentage}%</span>
                      </div>
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/20">
                        <span className="text-amber-300/70 block text-[10px] uppercase font-black">Accuracy</span>
                        <span className="text-xl font-black text-amber-400">{top1.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🥉 3rd Place */}
                {top3 && (
                  <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-amber-700/40 shadow-xl flex flex-col items-center text-center space-y-3 relative group hover:scale-[1.02] transition">
                    <span className="text-xs font-black text-amber-500 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-700/50">
                      🥉 3RD PLACE
                    </span>
                    <div className="relative">
                      <img
                        src={top3.studentAvatar}
                        alt={top3.studentName}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700/60 shadow-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white truncate max-w-[180px]">
                        {top3.studentName}
                      </h3>
                      <span className="text-xs text-slate-400">{top3.studentEmail || "Student"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-white/5 text-xs">
                      <div className="bg-slate-950/60 p-2.5 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Score</span>
                        <span className="text-base font-black text-white">{top3.percentage}%</span>
                      </div>
                      <div className="bg-slate-950/60 p-2.5 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
                        <span className="text-base font-black text-amber-500">{top3.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Rankings Table */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Full Examination Standings</h3>
                  <p className="text-xs text-slate-400">Showing {filteredLeaderboard.length} ranked students</p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 w-60"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/5">
                    <tr>
                      <th className="py-3.5 px-4 font-bold w-16"># Rank</th>
                      <th className="py-3.5 px-4 font-bold">Student</th>
                      <th className="py-3.5 px-4 font-bold">Exam</th>
                      <th className="py-3.5 px-4 font-bold text-center">Score (%)</th>
                      <th className="py-3.5 px-4 font-bold text-center">Accuracy</th>
                      <th className="py-3.5 px-4 font-bold text-center">Points</th>
                      <th className="py-3.5 px-4 font-bold">Completion Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeaderboard.length > 0 ? (
                      filteredLeaderboard.map((item, index) => {
                        const rankNumber = item.rank || index + 1;
                        const isGold = rankNumber === 1;
                        const isSilver = rankNumber === 2;
                        const isBronze = rankNumber === 3;

                        return (
                          <tr
                            key={item._id || index}
                            className={`hover:bg-white/[0.03] transition ${
                              isGold ? "bg-amber-500/5 font-semibold" : ""
                            }`}
                          >
                            {/* Rank */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${
                                  isGold
                                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                                    : isSilver
                                    ? "bg-slate-300 text-slate-950"
                                    : isBronze
                                    ? "bg-amber-700 text-white"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {rankNumber}
                              </span>
                            </td>

                            {/* Student */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.studentAvatar}
                                  alt={item.studentName}
                                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                                />
                                <div>
                                  <div className="font-bold text-white">{item.studentName}</div>
                                  <div className="text-[10px] text-slate-500">{item.studentEmail}</div>
                                </div>
                              </div>
                            </td>

                            {/* Exam */}
                            <td className="py-3.5 px-4 text-slate-300 truncate max-w-[180px]">
                              {item.examTitle}
                            </td>

                            {/* Score */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-extrabold text-sm text-white">{item.percentage}%</span>
                            </td>

                            {/* Accuracy */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-extrabold text-sm text-cyan-400">{item.accuracy}%</span>
                            </td>

                            {/* Points */}
                            <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                              {item.score} / {item.maxScore}
                            </td>

                            {/* Date */}
                            <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          <Trophy size={36} className="mx-auto mb-2 text-amber-400/40" />
                          No student exam records yet. Take an exam to claim 1st place!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
