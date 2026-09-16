import React, { useEffect, useState } from "react";
import axios from "axios";
import { GraduationCap, Trash2, RefreshCw, Mail, Calendar, Shield, User } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

const StudentDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all students from MongoDB
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3300/api/auth/students");
      setStudents(res.data.students || []);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const deleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student account "${name}"?`)) return;

    try {
      await axios.delete(`http://localhost:3300/api/auth/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      alert("Student deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete student");
    }
  };

  useEffect(() => {
    fetchStudents();
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
              <span className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-600/20 text-white font-black">
                <GraduationCap size={24} />
              </span>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Students Directory 🎓
              </h1>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              View and manage all registered student accounts stored in MongoDB.
            </p>
          </div>

          <button
            onClick={fetchStudents}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : ""} />
            Refresh List
          </button>
        </div>

        {/* Students Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap size={20} className="text-blue-600" />
              Registered Students
            </h2>
            <span className="text-xs font-semibold text-slate-500">{students.length} Enrolled Students</span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto" />
              <p className="text-sm font-semibold">Loading students from database...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <GraduationCap size={48} className="mx-auto text-slate-300" />
              <p className="text-base font-bold text-slate-700">No Students Found</p>
              <p className="text-xs">No student accounts are currently registered in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Student</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-center pr-6">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => {
                    const fallbackSeed = encodeURIComponent(s.email || s.username || s._id || "student");
                    const photo = s.profilePic || `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackSeed}&backgroundColor=dbeafe`;
                    const displayName = s.name || s.username || s.email?.split('@')[0] || "Student";

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={photo}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm bg-slate-100"
                              onError={(e) => {
                                e.target.src = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-800">{displayName}</p>
                              <p className="text-xs text-slate-400">@{s.username || s.email?.split('@')[0] || "student"}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} className="text-slate-400" />
                            {s.email}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                            <Shield size={12} />
                            Student
                          </span>
                        </td>

                        <td className="p-4 text-slate-500 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" />
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Active"}
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-center">
                          <button
                            onClick={() => deleteStudent(s._id, displayName)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Student Account"
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

export default StudentDashboard;