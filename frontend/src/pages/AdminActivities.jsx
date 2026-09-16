import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  Shield,
  HelpCircle,
  BookOpen,
  FileText,
  User,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

const typeBadges = {
  auth: { bg: "bg-blue-100 text-blue-800 border-blue-200", icon: <Shield size={16} /> },
  question: { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <HelpCircle size={16} /> },
  exam: { bg: "bg-purple-100 text-purple-800 border-purple-200", icon: <FileText size={16} /> },
  course: { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <BookOpen size={16} /> },
  result: { bg: "bg-rose-100 text-rose-800 border-rose-200", icon: <CheckCircle size={16} /> },
  user: { bg: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: <User size={16} /> },
  system: { bg: "bg-gray-100 text-gray-800 border-gray-200", icon: <Activity size={16} /> }
};

const roleBadges = {
  admin: "bg-red-500 text-white",
  teacher: "bg-emerald-600 text-white",
  student: "bg-blue-600 text-white",
  system: "bg-gray-700 text-white"
};

export default function AdminActivities() {
  const [isOpen, setIsOpen] = useState(true);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      setRefreshing(true);
      const params = {};
      if (selectedType !== "all") params.type = selectedType;
      if (selectedRole !== "all") params.role = selectedRole;
      if (searchTerm) params.search = searchTerm;

      const [actRes, statsRes] = await Promise.all([
        axios.get("http://localhost:3300/api/activities", { params }),
        axios.get("http://localhost:3300/api/activities/stats")
      ]);

      setActivities(actRes.data.activities || []);
      setStats(statsRes.data || {});
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedType, selectedRole]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all MongoDB activity logs? This action cannot be undone.")) return;
    try {
      await axios.delete("http://localhost:3300/api/activities/clear/all");
      fetchActivities();
    } catch (err) {
      console.error("Failed to clear activities:", err);
      alert("Failed to clear activities");
    }
  };

  const handleDeleteOne = async (id) => {
    try {
      await axios.delete(`http://localhost:3300/api/activities/${id}`);
      setActivities(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error("Failed to delete activity:", err);
      alert("Failed to delete activity");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Activity className="text-teal-600" size={32} />
                System Activity Log
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time MongoDB audit trail of all actions, logins, question edits, and exam submissions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchActivities}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin text-teal-600" : ""} />
                Refresh
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
              >
                <Trash2 size={18} />
                Clear Logs
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatPill label="Total Logs" count={stats.totalActivities || 0} color="from-slate-700 to-slate-900" />
            <StatPill label="Auth Events" count={stats.authActivities || 0} color="from-blue-600 to-blue-800" />
            <StatPill label="Questions" count={stats.questionActivities || 0} color="from-amber-500 to-amber-700" />
            <StatPill label="Exams" count={stats.examActivities || 0} color="from-purple-600 to-purple-800" />
            <StatPill label="Submissions" count={stats.resultActivities || 0} color="from-rose-500 to-rose-700" />
            <StatPill label="Courses" count={stats.courseActivities || 0} color="from-emerald-600 to-emerald-800" />
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-96">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions, user, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="p-2 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Types</option>
                  <option value="auth">Authentication</option>
                  <option value="question">Questions</option>
                  <option value="exam">Exams</option>
                  <option value="result">Submissions & Marks</option>
                  <option value="course">Courses</option>
                  <option value="user">User Management</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Role:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="p-2 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </div>

          {/* Activities Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500 space-y-3">
                <RefreshCw size={32} className="animate-spin text-teal-600 mx-auto" />
                <p className="font-medium">Loading live activities from MongoDB...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <Activity size={40} className="text-gray-300 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-700">No activities recorded yet</h3>
                <p className="text-sm text-gray-500">Activities will be automatically stored in MongoDB as actions occur.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Action</th>
                      <th className="p-4 font-semibold">Details</th>
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Timestamp</th>
                      <th className="p-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activities.map((a) => {
                      const badge = typeBadges[a.type] || typeBadges.system;
                      const roleClass = roleBadges[a.role] || "bg-gray-600 text-white";

                      return (
                        <tr key={a._id} className="hover:bg-slate-50 transition">
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                              {badge.icon}
                              <span className="capitalize">{a.type}</span>
                            </span>
                          </td>

                          <td className="p-4 font-semibold text-gray-800 whitespace-nowrap">
                            {a.action}
                          </td>

                          <td className="p-4 text-gray-600 max-w-md">
                            {a.details}
                          </td>

                          <td className="p-4 font-medium text-gray-700 whitespace-nowrap">
                            {a.user || "System"}
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${roleClass}`}>
                              {a.role}
                            </span>
                          </td>

                          <td className="p-4 text-gray-500 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} />
                              <span>{new Date(a.timestamp || a.createdAt).toLocaleString()}</span>
                            </div>
                          </td>

                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteOne(a._id)}
                              title="Delete log"
                              className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                            >
                              <Trash2 size={16} />
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

function StatPill({ label, count, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white p-4 rounded-2xl shadow-sm`}>
      <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{count}</p>
    </div>
  );
}
