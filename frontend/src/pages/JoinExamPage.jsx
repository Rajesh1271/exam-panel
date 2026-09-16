import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  QrCode,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Clock,
  HelpCircle,
  Lock,
  ChevronLeft
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar";

export default function JoinExamPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [examCode, setExamCode] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifiedExam, setVerifiedExam] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleLookup = async (codeToSearch) => {
    const target = codeToSearch || examCode;
    if (!target.trim()) {
      setError("Please enter a valid Exam Access Code.");
      return;
    }

    setLoading(true);
    setError("");
    setVerifiedExam(null);

    try {
      const res = await axios.get(`http://localhost:3300/api/exams/code/${target.trim()}`);
      if (res.data?.success && res.data.exam) {
        setVerifiedExam(res.data.exam);
      } else {
        setError("Invalid exam code or exam is not currently active.");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setError(err.response?.data?.error || "Exam code not found. Please verify with your instructor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCode = searchParams.get("code");
    if (initialCode) {
      setExamCode(initialCode);
      handleLookup(initialCode);
    }
  }, [searchParams]);

  const handleStartExam = () => {
    if (!verifiedExam) return;
    navigate(`/student-exam/${verifiedExam._id || verifiedExam.id}`);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <StudentSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} flex flex-col justify-center items-center p-6 md:p-12`}>
        <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/25 mb-1">
              <QrCode size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Join Online Examination
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Scan your instructor's QR code or enter the unique Access Code below to begin.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Access Code Input */}
          {!verifiedExam && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Exam Access Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. JAVA-2026-09"
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-800/90 text-white font-mono tracking-widest text-center text-lg rounded-2xl border border-slate-700 focus:outline-none focus:border-cyan-400 uppercase transition"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !examCode.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Code with MongoDB...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Verified Exam Card */}
          {verifiedExam && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Verified Exam Found
                  </span>
                  <span className="text-xs font-mono text-slate-400">{verifiedExam.examcode}</span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {verifiedExam.title || verifiedExam.examname}
                </h3>

                <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl">
                    <Clock size={15} className="text-cyan-400" />
                    <span>{verifiedExam.durationMinutes || verifiedExam.duration || 30} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl">
                    <HelpCircle size={15} className="text-purple-400" />
                    <span>{verifiedExam.questionCount} Questions</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setVerifiedExam(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Change Code
                </button>

                <button
                  onClick={handleStartExam}
                  className="flex-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
                >
                  <Lock size={16} />
                  <span>Enter Exam Lock</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
