import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  Clock,
  FileText,
  ArrowRight,
  Sparkles
} from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar";
import StudentSidebar from "../components/StudentSidebar";
import AdminSidebar from "../components/AdminSidebar";
import { onRealtimeEvent } from "../utils/socket";

const TakeExam = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  let userRole = "student";
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    userRole = u.role || localStorage.getItem("role") || "student";
  } catch (e) {}

  const loadExams = () => {
    axios
      .get("http://localhost:3300/api/exams")
      .then((res) => {
        setExams(Array.isArray(res.data) ? res.data : (res.data?.exams || []));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load exams from MongoDB:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadExams();

    const unsubscribe = onRealtimeEvent((type) => {
      if (
        type === "examCreated" || 
        type === "examDeleted" || 
        type === "examUpdated" || 
        type === "questionAdded" || 
        type === "questionDeleted" || 
        type === "questionUpdated"
      ) {
        loadExams();
      }
    });

    return () => unsubscribe();
  }, []);

  const renderSidebar = () => {
    if (userRole === "admin") return <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />;
    if (userRole === "teacher") return <TeacherSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />;
    return <StudentSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {renderSidebar()}

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} p-6 md:p-8 space-y-8`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 text-white font-black">
                <BookOpen size={24} />
              </span>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Online Examination Portal
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select an exam below to begin your test session.
            </p>
          </div>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <div className="bg-slate-900/80 p-12 rounded-3xl border border-white/10 text-center space-y-4 shadow-xl">
            <FileText size={48} className="text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Active Exams Available</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Please check back shortly or create a new examination in the Teacher / Admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((ex) => {
              return (
                <div
                  key={ex._id}
                  className="bg-gradient-to-b from-slate-900 to-slate-900/80 p-6 rounded-3xl border border-white/10 hover:border-teal-500/40 shadow-xl transition-all hover:scale-[1.01] flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-[10px] font-extrabold border border-cyan-500/30">
                        {ex.course?.name || "General Certification"}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white leading-snug">
                      {ex.title || ex.examname}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl">
                        <Clock size={14} className="text-teal-400" />
                        <span>{ex.durationMinutes || 30} Mins</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl">
                        <FileText size={14} className="text-purple-400" />
                        <span>{ex.questionCount || ex.questionIds?.length || 0} Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/student-exam/${ex._id}`}
                      state={{ exam: ex }}
                      className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>Start Exam</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeExam;
