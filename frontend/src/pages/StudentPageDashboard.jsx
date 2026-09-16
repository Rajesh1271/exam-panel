import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import axios from "axios";
import { 
  BookOpen, 
  Clock, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw, 
  Award, 
  Sparkles,
  AlertCircle
} from "lucide-react";

import { onRealtimeEvent } from "../utils/socket";

const StudentPageDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getStudentUser = () => {
    try {
      const studentStored = localStorage.getItem("student_user");
      if (studentStored) {
        const parsed = JSON.parse(studentStored);
        if (parsed?.name || parsed?._id) return parsed;
      }
      const genericUser = localStorage.getItem("user");
      if (genericUser) {
        const parsed = JSON.parse(genericUser);
        if (parsed?.role === "student") return parsed;
      }
    } catch (e) {
      console.warn("Error parsing student user from localStorage:", e);
    }
    return null;
  };

  const getStudentId = () => {
    const sUser = getStudentUser();
    if (sUser?._id) return sUser._id;
    if (sUser?.id) return sUser.id;
    if (localStorage.getItem("role") === "student") {
      return localStorage.getItem("userid") || localStorage.getItem("userId") || null;
    }
    return null;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();

      const [examsRes, resultsRes] = await Promise.allSettled([
        axios.get("http://localhost:3300/api/exams"),
        studentId ? axios.get(`http://localhost:3300/api/results/student/${studentId}`) : axios.get("http://localhost:3300/api/results")
      ]);

      if (examsRes.status === "fulfilled") {
        const raw = examsRes.value.data;
        const list = Array.isArray(raw) ? raw : (raw?.exams || []);
        setExams(list);
      } else {
        console.error("Error loading exams:", examsRes.reason);
      }

      if (resultsRes.status === "fulfilled") {
        const raw = resultsRes.value.data;
        let list = Array.isArray(raw) ? raw : (raw?.results || []);
        if (list.length === 0 && studentId) {
          try {
            const allRes = await axios.get("http://localhost:3300/api/results");
            const allList = Array.isArray(allRes.data) ? allRes.data : allRes.data?.results || [];
            const matched = allList.filter(r => {
              const rSid = r.studentId?._id || r.studentId || r.student?._id || r.student;
              return String(rSid) === String(studentId);
            });
            if (matched.length > 0) list = matched;
            else if (allList.length > 0) list = allList;
          } catch (e) {}
        }
        setResults(list);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sUser = getStudentUser();
    setUser(sUser || { name: "Student", role: "student" });
    fetchDashboardData();

    // Real-time synchronization
    const unsubscribe = onRealtimeEvent((type) => {
      if (
        type === "examCreated" || 
        type === "examDeleted" || 
        type === "examUpdated" || 
        type === "examSubmitted" || 
        type === "resultCreated" || 
        type === "resultUpdated" || 
        type === "resultDeleted" || 
        type === "questionAdded" || 
        type === "questionDeleted" || 
        type === "questionUpdated"
      ) {
        fetchDashboardData();
      }
    });

    return () => unsubscribe();
  }, []);

  const completedExamIds = new Set(results.map(r => r.exam?._id || r.examId?._id || r.examId || r.exam));

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <StudentSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} p-6 md:p-8 space-y-8`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20 text-white font-black">
                <Sparkles size={22} />
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Welcome, {user?.name || "Student"}! 🎓
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Access your online examinations, view question papers, and monitor test scores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-purple-400" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-950/60 to-slate-900/80 p-6 rounded-3xl border border-purple-500/20 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Exams</span>
              <BookOpen size={20} />
            </div>
            <p className="text-4xl font-black text-white mt-3">{exams.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Ready to take</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900/80 p-6 rounded-3xl border border-emerald-500/20 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Tests</span>
              <Award size={20} />
            </div>
            <p className="text-4xl font-black text-white mt-3">{results.length}</p>
            <Link to="/student-marks" className="text-[11px] text-emerald-400 hover:underline mt-1 inline-block font-semibold">
              View scored results →
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-950/60 to-slate-900/80 p-6 rounded-3xl border border-blue-500/20 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Tests</span>
              <FileText size={20} />
            </div>
            <p className="text-4xl font-black text-white mt-3">
              {Math.max(0, exams.length - results.length)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting completion</p>
          </div>
        </div>

        {/* Exams Table Card */}
        <div className="bg-slate-900/80 rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Available Examinations</h2>
                <p className="text-xs text-slate-400">Synced directly from MongoDB database</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20 self-start sm:self-auto">
              {exams.length} Ready
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3">
              <RefreshCw size={32} className="animate-spin text-purple-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Fetching Examinations from Database...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-16 text-center space-y-3 text-slate-400">
              <AlertCircle size={44} className="mx-auto text-slate-600" />
              <p className="text-base font-bold text-white">No active exams published</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your teachers have not published any exams yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-white/5 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Exam Title</th>
                    <th className="p-4">Course / Subject</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Questions</th>
                    <th className="p-4 text-center pr-6">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {exams.map((ex) => {
                    const isCompleted = completedExamIds.has(ex._id);

                    return (
                      <tr key={ex._id} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{ex.title || ex.examname}</span>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                                <CheckCircle size={10} /> Completed
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/20">
                            <BookOpen size={12} />
                            {ex.course?.name || ex.course?.coursename || "General"}
                          </span>
                        </td>

                        <td className="p-4 text-slate-300">
                          <span className="flex items-center gap-1.5 text-xs">
                            <Clock size={14} className="text-purple-400" />
                            {ex.durationMinutes || ex.duration || 30} Mins
                          </span>
                        </td>

                        <td className="p-4 text-slate-300 text-xs font-medium">
                          {ex.questionCount || ex.questionIds?.length || 0} Questions
                        </td>

                        <td className="p-4 pr-6 text-center">
                          <Link
                            to={`/student-exam/${ex._id}`}
                            state={{ exam: ex }}
                            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition active:scale-95 ${
                              isCompleted
                                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
                                : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/20"
                            }`}
                          >
                            <span>{isCompleted ? "Retake Exam" : "Start Exam"}</span>
                            <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPageDashboard;