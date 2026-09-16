import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherNavbar from "../components/TeacherNavbar";
import TeacherSidebar from "../components/TeacherSidebar";
import axios from "axios";
import {
  Users,
  BookOpen,
  HelpCircle,
  FileText,
  PlusCircle,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle,
  RefreshCw
} from "lucide-react";

import { onRealtimeEvent } from "../utils/socket";

const TeacherPageDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3300/api/auth/teacher/dashboard");
      setStats(res.data || {});
    } catch (error) {
      console.error("Error fetching teacher dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen to real-time events across the panel
    const unsubscribe = onRealtimeEvent(() => {
      fetchStats();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100 animate-pulse">
        <TeacherSidebar isOpen={isOpen} />
        <div className={`flex-1 ${isOpen ? "ml-64" : "ml-20"} p-8 space-y-8`}>
          <div className="h-10 w-72 bg-slate-300 rounded-xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30">
      <TeacherSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">
                Teacher Dashboard 📚
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your students, questions, and online examinations stored in MongoDB.
              </p>
            </div>

            <button
              onClick={fetchStats}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl shadow-sm transition text-sm font-medium"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              icon={<Users size={26} />}
              gradient="from-blue-600 to-indigo-700"
              link="/teacher-students"
            />
            <StatCard
              title="Question Bank"
              value={stats?.totalQuestions || 0}
              icon={<HelpCircle size={26} />}
              gradient="from-amber-500 to-orange-600"
              link="/teacher-questions"
            />
            <StatCard
              title="Courses"
              value={stats?.totalCourses || 0}
              icon={<BookOpen size={26} />}
              gradient="from-emerald-600 to-teal-700"
              link="/courses"
            />
            <StatCard
              title="Published Exams"
              value={stats?.totalExams || 0}
              icon={<FileText size={26} />}
              gradient="from-purple-600 to-indigo-800"
              link="/teacher-exams"
            />
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span>
              Instructor Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => navigate("/teacher-questions")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-teal-100 bg-teal-50/50 hover:bg-teal-100 hover:scale-105 transition text-teal-800 font-semibold text-sm gap-2"
              >
                <PlusCircle size={24} className="text-teal-600" />
                Add Question (MongoDB)
              </button>

              <button
                onClick={() => navigate("/teacher-create-exam")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100 hover:scale-105 transition text-purple-800 font-semibold text-sm gap-2"
              >
                <FileText size={24} className="text-purple-600" />
                Create Exam
              </button>

              <button
                onClick={() => navigate("/teacher-exams")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100 hover:scale-105 transition text-amber-800 font-semibold text-sm gap-2"
              >
                <BookOpen size={24} className="text-amber-600" />
                View Exams
              </button>

              <button
                onClick={() => navigate("/teacher-students")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:scale-105 transition text-slate-800 font-semibold text-sm gap-2"
              >
                <Users size={24} className="text-slate-700" />
                Manage Students
              </button>
            </div>
          </div>

          {/* Recent Activities Feed from MongoDB */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-teal-600" />
              Recent MongoDB Activity Feed
            </h3>

            {(!stats?.recentActivities || stats.recentActivities.length === 0) ? (
              <p className="text-slate-400 text-sm py-4">No recent activity found in MongoDB.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recentActivities.map((act) => (
                  <div key={act._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{act.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{act.details}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(act.timestamp || act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient, link }) => (
  <Link
    to={link}
    className={`bg-gradient-to-br ${gradient} text-white p-6 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 block`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider font-semibold opacity-80">{title}</p>
        <p className="text-3xl font-extrabold mt-2">{value}</p>
      </div>
      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner">{icon}</div>
    </div>
  </Link>
);

export default TeacherPageDashboard;
