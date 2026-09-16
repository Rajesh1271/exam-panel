// StudentExamPage.jsx - Clean, Fast & Reliable Exam Taking
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Award,
  BookOpen,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Zap
} from "lucide-react";
import { onRealtimeEvent } from "../utils/socket";

export default function StudentExamPage() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [exam, setExam] = useState(location.state?.exam || null);
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [resultId, setResultId] = useState(location.state?.resultId || null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min default
  const [studentId, setStudentId] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Review states
  const [showReview, setShowReview] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [syncNotification, setSyncNotification] = useState("");

  // ------------------- RESOLVE LOGGED-IN STUDENT -------------------
  useEffect(() => {
    try {
      const studentStored = localStorage.getItem("student_user");
      if (studentStored) {
        const obj = JSON.parse(studentStored);
        if (obj?._id || obj?.id || obj?.name) {
          setStudentId(obj?._id || obj?.id || null);
          setStudentName(obj?.name || obj?.username || "Student");
          return;
        }
      }
      const genericUser = localStorage.getItem("user");
      if (genericUser) {
        const obj = JSON.parse(genericUser);
        if (obj?.role === "student") {
          setStudentId(obj?._id || obj?.id || null);
          setStudentName(obj?.name || obj?.username || "Student");
          return;
        }
      }
      if (localStorage.getItem("role") === "student") {
        setStudentId(localStorage.getItem("userid") || null);
        setStudentName("Student");
      }
    } catch (err) {
      console.warn("StudentID resolve error:", err);
    }
  }, []);

  // ------------------- LOAD EXAM & QUESTIONS FROM MONGODB -------------------
  const fetchExamData = async () => {
    try {
      setLoading(true);
      const resolvedId = studentId || localStorage.getItem("userid");
      const params = resolvedId ? { studentId: resolvedId } : {};
      const res = await axios.get(`http://localhost:3300/api/exams/${examId}/start`, { params });

      if (res?.data) {
        setExam(res.data.exam);
        const qList = res.data.questions || [];
        setQuestions(qList);
        setResultId(res.data.resultId);
        setTimeLeft((res.data.exam?.durationMinutes || res.data.exam?.duration || 30) * 60);
        setMaxScore(qList.length);
      }
    } catch (err) {
      console.error("Failed to load exam data:", err);
      // Fallback: try fetching the exam directly
      try {
        const directRes = await axios.get(`http://localhost:3300/api/exams/${examId}`);
        if (directRes?.data) {
          setExam(directRes.data);
          const qList = directRes.data.questionIds || [];
          setQuestions(qList);
          setTimeLeft((directRes.data.durationMinutes || directRes.data.duration || 30) * 60);
          setMaxScore(qList.length);
        }
      } catch (e2) {
        console.error("Direct exam fetch failed:", e2);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) fetchExamData();
  }, [examId, studentId]);

  // ------------------- REAL-TIME LIVE SYNC WITH MONGODB -------------------
  useEffect(() => {
    if (!examId) return;

    const unsubscribe = onRealtimeEvent(async (type, payload) => {
      if (type === "examUpdated" || type === "questionAdded" || type === "questionDeleted") {
        // If specific to another exam, skip
        if (type === "examUpdated" && payload?._id && String(payload._id) !== String(examId)) {
          return;
        }

        try {
          const resolvedId = studentId || localStorage.getItem("userid");
          const params = resolvedId ? { studentId: resolvedId } : {};
          const res = await axios.get(`http://localhost:3300/api/exams/${examId}/start`, { params });

          if (res?.data?.questions) {
            const newQList = res.data.questions;
            setQuestions((prev) => {
              const prevIds = new Set((prev || []).map((q) => q._id));
              const newlyAdded = newQList.filter((q) => !prevIds.has(q._id));
              if (newlyAdded.length > 0) {
                setSyncNotification(`⚡ ${newlyAdded.length} new question(s) dynamically synchronized to this exam in real-time!`);
                setTimeout(() => setSyncNotification(""), 6000);
              }
              return newQList;
            });
            if (res.data.exam) setExam(res.data.exam);
            setMaxScore(newQList.length);
          }
        } catch (syncErr) {
          console.warn("Real-time live sync error:", syncErr);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [examId, studentId]);

  // ------------------- LIVE TIMER -------------------
  useEffect(() => {
    if (loading || submitted || showReview) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitted, showReview]);

  // ------------------- ANSWER SELECTION -------------------
  const selectAnswer = (qid, opt) => {
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  // ------------------- SUBMIT EXAM -------------------
  const submitExam = async () => {
    if (submitted) return;
    setSubmitted(true);

    try {
      const answerArray = Object.keys(answers).map((qid) => ({
        questionId: qid,
        selectedOption: answers[qid],
      }));

      const resolvedId = studentId || localStorage.getItem("userid");
      const payload = {
        studentId: resolvedId || undefined,
        resultId,
        answers: answerArray,
        startedAt: new Date(Date.now() - (exam?.durationMinutes || 30) * 60000)
      };

      const res = await axios.post(
        `http://localhost:3300/api/exams/${examId}/submit`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const resScore = res.data.score ?? 0;
      const resMax = res.data.maxScore || questions.length || 1;
      const resPct = resMax > 0 ? Math.round((resScore / resMax) * 100) : 0;

      setFinalScore(resScore);
      setMaxScore(resMax);
      setPercentage(resPct);
      setShowReview(true);
    } catch (err) {
      console.error("Submit error:", err);
      // Client-side grade calculation fallback
      let clientScore = 0;
      questions.forEach((q) => {
        if (answers[q._id] && answers[q._id] === q.correctAnswer) {
          clientScore += 1;
        }
      });
      const clientMax = questions.length || 1;
      const clientPct = Math.round((clientScore / clientMax) * 100);

      setFinalScore(clientScore);
      setMaxScore(clientMax);
      setPercentage(clientPct);
      setShowReview(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to finalize and submit your answers?")) return;
    submitExam();
  };

  // ------------------- LOADING / EMPTY STATES -------------------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-base font-bold text-slate-300">Loading Examination from MongoDB...</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md text-center space-y-4">
          <HelpCircle size={48} className="text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">No Questions Assigned</h2>
          <p className="text-slate-400 text-xs">
            This exam currently does not have questions populated in MongoDB.
          </p>
          <Link
            to="/student-dashboardpage"
            className="inline-block bg-teal-500 hover:bg-teal-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ------------------- REVIEW / RESULTS PAGE AFTER SUBMISSION -------------------
  if (showReview) {
    const isPassed = percentage >= 40;
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex justify-center items-center">
        <div className="max-w-3xl w-full mx-auto space-y-6">
          {/* Result Score Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-white/10">
            <div className="inline-flex p-4 rounded-full bg-teal-500/10 text-teal-400 mx-auto ring-4 ring-teal-500/20 shadow-lg">
              <Award size={48} />
            </div>

            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Exam Completed Successfully! 🎉
              </h2>
              <p className="text-slate-400 text-xs mt-1">{exam?.title || exam?.examname || "Online Examination"}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto py-5 bg-slate-950/60 rounded-2xl border border-white/5">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</p>
                <p className="text-2xl font-black text-white mt-1">{finalScore} / {maxScore}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Percentage</p>
                <p className={`text-2xl font-black mt-1 ${isPassed ? "text-emerald-400" : "text-rose-400"}`}>
                  {percentage}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Grade Status</p>
                <p className={`text-2xl font-black mt-1 ${isPassed ? "text-emerald-400" : "text-rose-400"}`}>
                  {isPassed ? "Passed" : "Failed"}
                </p>
              </div>
            </div>

            {/* Question Review Breakdown */}
            <div className="text-left space-y-3 pt-4 border-t border-white/10 max-h-96 overflow-y-auto pr-2">
              <h3 className="text-sm font-bold text-slate-200">Answer Review:</h3>
              {questions.map((q, idx) => {
                const userAns = answers[q._id];
                const isCorrect = userAns && userAns === q.correctAnswer;
                return (
                  <div key={q._id || idx} className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                    <p className="text-xs font-bold text-white">
                      {idx + 1}. {q.questionText}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className={`px-2.5 py-1 rounded-lg font-bold ${isCorrect ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"}`}>
                        Your Answer: {userAns || "Not Answered"}
                      </span>
                      {!isCorrect && (
                        <span className="px-2.5 py-1 rounded-lg font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Correct Answer: {q.correctAnswer}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Link
                to="/student-marks"
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-teal-500/20 transition active:scale-95 text-xs"
              >
                View All My Marks
              </Link>
              <Link
                to="/student-dashboardpage"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition active:scale-95 text-xs"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------- LIVE EXAM TAKING INTERFACE -------------------
  const currentQ = questions[currentQuestionIndex];
  const minutesLeft = Math.floor(timeLeft / 60);
  const secondsLeft = String(timeLeft % 60).padStart(2, "0");
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Top Header: Title & Live Countdown Timer */}
        <div className="bg-slate-900 border border-white/10 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20 text-white font-black">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white truncate max-w-sm">
                {exam?.title || exam?.examname || "Online Examination"}
              </h1>
              <p className="text-xs text-slate-400">Student: {studentName}</p>
            </div>
          </div>

          {/* Live Timer */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-black text-xl self-start sm:self-auto shadow-inner">
            <Clock size={20} className="text-rose-400" />
            <span>{minutesLeft}:{secondsLeft}</span>
          </div>
        </div>

        {/* Question Palette / Progress Bar */}
        <div className="bg-slate-900/80 border border-white/10 p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="text-teal-400 font-bold">{answeredCount} of {questions.length} Answered</span>
          </div>

          {/* Question Number Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q._id];
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q._id || idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition active:scale-95 ${
                    isCurrent
                      ? "bg-purple-600 text-white ring-2 ring-purple-400"
                      : isAnswered
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border border-white/5 hover:bg-slate-700"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Dynamic Sync Notification */}
        {syncNotification && (
          <div className="p-4 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-indigo-500/20 border border-teal-500/40 text-teal-300 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400 animate-pulse flex-shrink-0" />
              <span>{syncNotification}</span>
            </div>
            <button
              onClick={() => setSyncNotification("")}
              className="text-teal-400 hover:text-white text-xs px-2 py-0.5 rounded-lg hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Active Question Card */}
        {currentQ && (
          <div className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-white leading-relaxed">
              {currentQuestionIndex + 1}. {currentQ.questionText}
            </h2>

            <div className="space-y-3">
              {(currentQ.options || []).map((opt, i) => {
                const isSelected = answers[currentQ._id] === opt;
                return (
                  <div
                    key={i}
                    onClick={() => selectAnswer(currentQ._id, opt)}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-500/10"
                        : "border-slate-800 hover:border-slate-700 bg-slate-800/40 hover:bg-slate-800/80"
                    }`}
                  >
                    <input
                      type="radio"
                      id={`opt_${currentQ._id}_${i}`}
                      name={`question_${currentQ._id}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => selectAnswer(currentQ._id, opt)}
                      className="w-4 h-4 text-teal-400 focus:ring-teal-400 bg-slate-800 border-slate-700"
                    />
                    <label
                      htmlFor={`opt_${currentQ._id}_${i}`}
                      className="cursor-pointer font-medium text-slate-200 text-sm flex-1"
                    >
                      {opt}
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-5 border-t border-white/5">
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-teal-500/20 transition"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition"
                >
                  <Send size={16} /> Submit Exam
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Submit Action */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-8 py-3 rounded-2xl font-bold text-xs border border-white/10 shadow-lg transition"
          >
            Finish & Submit Examination
          </button>
        </div>
      </div>
    </div>
  );
}
