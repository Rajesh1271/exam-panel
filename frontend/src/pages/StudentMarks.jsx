import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Clock, FileText, CheckCircle, ArrowLeft, RefreshCw, Sparkles, CheckCheck, XCircle } from 'lucide-react';
import StudentSidebar from '../components/StudentSidebar';
import StudentNavbar from '../components/StudentNavbar';
import { onRealtimeEvent } from '../utils/socket';

export default function StudentMarks() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const studentId = (() => {
    try {
      const su = localStorage.getItem('student_user');
      if (su) {
        const parsed = JSON.parse(su);
        if (parsed?._id || parsed?.id) return parsed._id || parsed.id;
      }
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u?.role === 'student' && (u?._id || u?.id)) return u._id || u.id;
      if (localStorage.getItem('role') === 'student') {
        return localStorage.getItem('userid') || localStorage.getItem('userId') || null;
      }
      return null;
    } catch {
      return null;
    }
  })();

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const url = studentId
        ? `http://localhost:3300/api/results/student/${studentId}`
        : `http://localhost:3300/api/results`;

      const res = await axios.get(url);
      let list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      
      // If student-specific endpoint returned empty, check all results as fallback
      if (list.length === 0 && studentId) {
        try {
          const allRes = await axios.get(`http://localhost:3300/api/results`);
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
    } catch (err) {
      console.error('Failed to load results from MongoDB:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();

    const unsubscribe = onRealtimeEvent((type) => {
      if (type === 'examSubmitted' || type === 'resultCreated' || type === 'resultUpdated' || type === 'resultDeleted' || type === 'examUpdated') {
        fetchMarks();
      }
    });

    return () => unsubscribe();
  }, [studentId]);

  const totalCompleted = results.length;
  const totalPassed = results.filter(r => {
    const max = r.maxScore || 1;
    const pct = r.percentage || Math.round((r.score / max) * 100);
    return pct >= 40;
  }).length;
  const avgPercentage = totalCompleted > 0 
    ? Math.round(results.reduce((acc, r) => {
        const max = r.maxScore || 1;
        return acc + (r.percentage || Math.round((r.score / max) * 100));
      }, 0) / totalCompleted)
    : 0;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <StudentSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                <Award size={32} className="text-teal-600 dark:text-teal-400" />
                My Exam Scores & Results
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                View your graded test submissions and score history stored in MongoDB with live real-time sync.
              </p>
            </div>

            <button
              onClick={fetchMarks}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl shadow-sm transition text-sm font-medium self-start sm:self-auto"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-teal-600 dark:text-teal-400' : ''} />
              Refresh Marks
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tests Completed</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalCompleted}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CheckCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exams Passed</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{totalPassed} / {totalCompleted}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Score</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{avgPercentage}%</p>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white">Exam History ({results.length})</h2>
              <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-800">
                ⚡ Live Real-Time MongoDB Synced
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading your marks from MongoDB...</div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
                <Award size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Exam Results Yet</h3>
                <p className="text-sm">You haven't completed any exams yet. Submit an exam to see your graded scorecard here!</p>
                <Link
                  to="/student-dashboardpage"
                  className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition"
                >
                  Browse Available Exams
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 font-semibold">Exam Title</th>
                      <th className="p-4 font-semibold">Score</th>
                      <th className="p-4 font-semibold">Percentage</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Submitted On</th>
                      <th className="p-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {results.map((r) => {
                      const max = r.maxScore || 1;
                      const pct = r.percentage || Math.round((r.score / max) * 100);
                      const isPassed = pct >= 40;

                      return (
                        <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                            {r.exam?.title || r.exam?.examname || "Online Exam"}
                          </td>

                          <td className="p-4 font-extrabold text-slate-800 dark:text-white">
                            {r.score} / {r.maxScore}
                          </td>

                          <td className="p-4 font-bold text-slate-700 dark:text-slate-200">
                            {pct}%
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isPassed
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              {isPassed ? "Passed" : "Failed"}
                            </span>
                          </td>

                          <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} />
                              {new Date(r.submittedAt || r.createdAt || Date.now()).toLocaleString()}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              onClick={() =>
                                navigate('/student-result', {
                                  state: { 
                                    score: r.score, 
                                    maxScore: r.maxScore, 
                                    exam: r.exam || r.examId,
                                    answers: r.answers,
                                    submittedAt: r.submittedAt || r.createdAt
                                  }
                                })
                              }
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow transition active:scale-95"
                            >
                              View Card
                            </button>
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
    </div>
  );
}
