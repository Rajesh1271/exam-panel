import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  UserCheck,
  BookOpen,
  HelpCircle,
  FileText,
  Activity,
  PlusCircle,
  ArrowRight,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import { onRealtimeEvent } from "../utils/socket";

const typeIcons = {
  auth: <Shield size={16} className="text-blue-500" />,
  question: <HelpCircle size={16} className="text-amber-500" />,
  exam: <FileText size={16} className="text-purple-500" />,
  course: <BookOpen size={16} className="text-emerald-500" />,
  result: <CheckCircle size={16} className="text-rose-500" />,
  user: <Users size={16} className="text-indigo-500" />,
  system: <Activity size={16} className="text-gray-500" />
};

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:3300/api/auth/dashboard");
      setStats(res.data || {});
      setRecentUsers(res.data.recentUsers || []);
      setRecentActivities(res.data.recentActivities || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const unsubscribe = onRealtimeEvent(() => {
      fetchDashboard();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100 animate-pulse">
        <AdminSidebar isOpen={isOpen} />
        <div className={`flex-1 ${isOpen ? "ml-64" : "ml-20"} p-8 space-y-8`}>
          <div className="h-10 w-72 bg-gray-300 rounded-xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-gray-200 rounded-2xl"></div>
            <div className="h-80 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30">
      <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Admin Control Center ⚡
              </h1>
              <p className="text-slate-500 mt-1">
                Live monitoring, question bank sync, and full activity logs stored in MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/questions"
                className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition active:scale-95"
              >
                <PlusCircle size={18} />
                Add Question
              </Link>
              <Link
                to="/admin-activities"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-slate-800/20 transition active:scale-95"
              >
                <Activity size={18} />
                Live Activities
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={stats.totalStudents ?? 0}
              icon={<Users size={26} />}
              gradient="from-blue-600 to-indigo-700"
              link="/admin-students"
            />
            <StatCard
              title="Total Teachers"
              value={stats.totalTeacher ?? 0}
              icon={<UserCheck size={26} />}
              gradient="from-emerald-600 to-teal-700"
              link="/teacher-dashboard"
            />
            <StatCard
              title="Question Bank"
              value={stats.totalQuestions ?? 0}
              icon={<HelpCircle size={26} />}
              gradient="from-amber-500 to-orange-600"
              link="/questions-list"
            />
            <StatCard
              title="Courses Available"
              value={stats.totalCourses ?? 0}
              icon={<BookOpen size={26} />}
              gradient="from-purple-600 to-indigo-800"
              link="/courses"
            />
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span>
              Quick Management Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => navigate("/questions")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-teal-100 bg-teal-50/50 hover:bg-teal-100 hover:scale-105 transition text-teal-800 font-semibold text-sm gap-2"
              >
                <PlusCircle size={24} className="text-teal-600" />
                Add New Question
              </button>

              <button
                onClick={() => navigate("/questions-list")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100 hover:scale-105 transition text-amber-800 font-semibold text-sm gap-2"
              >
                <HelpCircle size={24} className="text-amber-600" />
                Manage Question Bank
              </button>

              <button
                onClick={() => navigate("/courses")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100 hover:scale-105 transition text-purple-800 font-semibold text-sm gap-2"
              >
                <BookOpen size={24} className="text-purple-600" />
                Manage Courses
              </button>

              <button
                onClick={() => navigate("/admin-activities")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:scale-105 transition text-slate-800 font-semibold text-sm gap-2"
              >
                <Activity size={24} className="text-slate-700" />
                Audit Logs
              </button>
            </div>
          </div>

          {/* Main Content Grid: Recent Activities & Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Activities Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={20} className="text-teal-600" />
                    Live MongoDB Activity Log
                  </h3>
                  <Link
                    to="/admin-activities"
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>

                {recentActivities.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    No recent activities recorded. All actions will appear here automatically.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((act) => (
                      <div
                        key={act._id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition text-sm"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 mt-0.5">
                          {typeIcons[act.type] || <Activity size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 truncate">
                              {act.action}
                            </span>
                            <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(act.timestamp || act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                            {act.details}
                          </p>
                          <span className="inline-block mt-1 text-[11px] font-medium text-slate-500">
                            By {act.user || "System"} ({act.role})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <Link
                  to="/admin-activities"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
                >
                  Click to open full audit trail and filter logs →
                </Link>
              </div>
            </div>

            {/* Recent Registered Users */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    Recent Registered Users
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">MongoDB Synced</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-slate-400 border-b border-slate-100 pb-2">
                        <th className="pb-2 pl-2">User</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentUsers.length === 0 && (
                        <tr>
                          <td colSpan="3" className="py-6 text-center text-slate-400 text-sm">
                            No users registered yet
                          </td>
                        </tr>
                      )}
                      {recentUsers.map((u) => {
                        const fallbackSeed = encodeURIComponent(u.email || u.username || u._id || "user");
                        const photo = u.profilePic || (
                          u.role === "admin"
                            ? "https://cdn-icons-png.flaticon.com/512/219/219970.png"
                            : u.role === "teacher"
                            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}&backgroundColor=d1fae5`
                            : `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackSeed}&backgroundColor=dbeafe`
                        );
                        const displayName = u.name || u.username || u.email?.split('@')[0] || "User";

                        return (
                          <tr key={u._id} className="hover:bg-slate-50 transition">
                            <td className="py-3 pl-2 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={photo}
                                  alt={displayName}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100 shadow-xs"
                                  onError={(e) => {
                                    e.target.src = u.role === "admin"
                                      ? "https://cdn-icons-png.flaticon.com/512/219/219970.png"
                                      : u.role === "teacher"
                                      ? "https://cdn-icons-png.flaticon.com/512/3429/3429402.png"
                                      : "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
                                  }}
                                />
                                <span className="font-semibold text-slate-800">
                                  {displayName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-600 whitespace-nowrap text-xs">
                              {u.email}
                            </td>
                            <td className="py-3 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                  u.role === "admin"
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : u.role === "teacher"
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-blue-100 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>Auto-refreshed with MongoDB</span>
                <Link to="/student-dashboard" className="text-indigo-600 font-medium hover:underline">
                  Manage Students & Teachers →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
