import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserCheck, Trash2, RefreshCw, Mail, Calendar, Shield } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

const TeacherDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all teachers from MongoDB
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3300/api/auth/teachers");
      setTeachers(res.data.teachers || []);
    } catch (error) {
      console.error("Failed to load teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Teacher
  const deleteTeacher = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete teacher account "${name}"?`)) return;

    try {
      await axios.delete(`http://localhost:3300/api/auth/teachers/${id}`);
      setTeachers((prev) => prev.filter((t) => t._id !== id));
      alert("Teacher deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete teacher");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30">
      {/* Sidebar */}
      <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} p-6 md:p-8 space-y-6`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-2xl shadow-lg shadow-emerald-600/20 text-white font-black">
                <UserCheck size={24} />
              </span>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Teachers Directory 👨‍🏫
              </h1>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              View and manage all registered instructor accounts stored in MongoDB.
            </p>
          </div>

          <button
            onClick={fetchTeachers}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-emerald-600" : ""} />
            Refresh List
          </button>
        </div>

        {/* Teachers Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck size={20} className="text-emerald-600" />
              Registered Teachers
            </h2>
            <span className="text-xs font-semibold text-slate-500">{teachers.length} Active Instructors</span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <RefreshCw size={32} className="animate-spin text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold">Loading teachers from database...</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <UserCheck size={48} className="mx-auto text-slate-300" />
              <p className="text-base font-bold text-slate-700">No Teachers Found</p>
              <p className="text-xs">No teacher accounts are currently registered in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Instructor</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-center pr-6">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t) => {
                    const fallbackSeed = encodeURIComponent(t.email || t.username || t._id || "teacher");
                    const photo = t.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}&backgroundColor=d1fae5`;
                    const displayName = t.name || t.username || t.email?.split('@')[0] || "Teacher";

                    return (
                      <tr key={t._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={photo}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm bg-slate-100"
                              onError={(e) => {
                                e.target.src = "https://cdn-icons-png.flaticon.com/512/3429/3429402.png";
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-800">{displayName}</p>
                              <p className="text-xs text-slate-400">@{t.username || t.email?.split('@')[0] || "teacher"}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} className="text-slate-400" />
                            {t.email}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
                            <Shield size={12} />
                            Teacher
                          </span>
                        </td>

                        <td className="p-4 text-slate-500 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" />
                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Active"}
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-center">
                          <button
                            onClick={() => deleteTeacher(t._id, displayName)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Teacher Account"
                          >
                            <Trash2 size={18} />
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
  );
};

export default TeacherDashboard;