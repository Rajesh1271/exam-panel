import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Award, ArrowLeft, CheckCircle, Clock, BookOpen, RefreshCw, CheckCheck, XCircle } from "lucide-react";
import axios from "axios";

export default function StudentResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [score, setScore] = useState(state?.score ?? null);
  const [maxScore, setMaxScore] = useState(state?.maxScore ?? null);
  const [exam, setExam] = useState(state?.exam ?? null);
  const [answers, setAnswers] = useState(state?.answers ?? []);
  const [submittedAt, setSubmittedAt] = useState(state?.submittedAt ?? null);
  const [loading, setLoading] = useState(state?.score === undefined);

  useEffect(() => {
    if (score !== null && maxScore !== null) {
      setLoading(false);
      return;
    }

    const loadRecent = async () => {
      try {
        setLoading(true);
        let studentId = null;
        try {
          const s = JSON.parse(localStorage.getItem('student_user') || '{}');
          studentId = s._id || s.id;
          if (!studentId) {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            studentId = u._id || u.id;
          }
        } catch (e) {}

        const url = studentId 
          ? `http://localhost:3300/api/results/student/${studentId}` 
          : `http://localhost:3300/api/results`;
        const res = await axios.get(url);
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        if (list.length > 0) {
          const latest = list[0];
          setScore(latest.score);
          setMaxScore(latest.maxScore || 1);
          setExam(latest.exam || latest.examId);
          setAnswers(latest.answers || []);
          setSubmittedAt(latest.submittedAt || latest.createdAt);
        }
      } catch (err) {
        console.warn("Failed to load latest result fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <RefreshCw size={32} className="animate-spin text-teal-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Loading your graded exam result from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (score === null || maxScore === null) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md text-center space-y-4 border border-slate-200 dark:border-slate-700">
          <Award size={48} className="text-slate-300 dark:text-slate-600 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">No Result to Display</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Please select a result from your Marks page or take an exam first.</p>
          <button
            onClick={() => navigate("/student-dashboardpage")}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const isPassed = percentage >= 40;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 flex items-center justify-center p-4 md:p-8 transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-10 max-w-2xl w-full text-center space-y-6 border border-slate-200 dark:border-slate-800">
        <div className="inline-flex p-4 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mx-auto ring-4 ring-teal-500/20 shadow-lg">
          <Award size={48} />
        </div>

        <div>
          <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 rounded-full text-xs font-bold border border-teal-200 dark:border-teal-800">
            Official Exam Scorecard • MongoDB Permanent Record
          </span>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mt-2">
            {exam?.title || exam?.examname || "Online Examination"}
          </h1>
          {submittedAt && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <Clock size={12} />
              Submitted on: {new Date(submittedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Score</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{score} / {maxScore}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Percentage</span>
            <p className={`text-2xl font-black mt-0.5 ${isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {percentage}%
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Status</span>
            <p className={`text-2xl font-black mt-0.5 ${isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {isPassed ? "Passed" : "Failed"}
            </p>
          </div>
        </div>

        {/* Answer Review Breakdown if answers are attached */}
        {answers && answers.length > 0 && (
          <div className="text-left space-y-3 pt-2 max-h-72 overflow-y-auto pr-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Answer Breakdown:</h3>
            {answers.map((a, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {idx + 1}. {a.questionText || a.questionId?.questionText || `Question #${idx + 1}`}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-bold ${a.correct ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"}`}>
                    Your Answer: {a.selectedOption || "Not Answered"}
                  </span>
                  {!a.correct && (a.correctAnswer || a.questionId?.correctAnswer) && (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Correct: {a.correctAnswer || a.questionId?.correctAnswer}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/student-marks"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg text-xs transition active:scale-95"
          >
            View All My Marks
          </Link>
          <Link
            to="/student-dashboardpage"
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-lg text-xs transition active:scale-95"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

