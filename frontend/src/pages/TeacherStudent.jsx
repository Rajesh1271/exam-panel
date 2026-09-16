import React, { useEffect, useState } from "react";
import TeacherNavbar from "../components/TeacherNavbar";
import TeacherSidebar from "../components/TeacherSidebar";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, Eye, Trash2, RefreshCw, GraduationCap } from "lucide-react";

const TeacherStudents = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3300/api/auth/teacher/students`);
      setStudents(res.data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRemove = async (id) => {
    if (!confirm("Are you sure you want to remove this student account from MongoDB?")) return;
    try {
      await axios.delete(`http://localhost:3300/api/auth/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      alert("Student removed from MongoDB successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete student");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <TeacherSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                <GraduationCap size={32} className="text-teal-600" />
                Enrolled Students
              </h1>
              <p className="text-slate-600 mt-1">
                View student accounts and examine their test submissions stored in MongoDB.
              </p>
            </div>

            <button
              onClick={fetchStudents}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl shadow-sm transition text-sm font-medium"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-teal-600" : ""} />
              Refresh
            </button>
          </div>

          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Student Directory ({students.length})</h2>
              <span className="text-xs text-slate-400">MongoDB Synced</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading student directory from MongoDB...</div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No students registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold w-12 text-center">#</th>
                      <th className="p-4 font-semibold">Student Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Registered</th>
                      <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {students.map((stu, index) => (
                      <tr key={stu._id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-center text-slate-400 font-medium">{index + 1}</td>
                        <td className="p-4 font-bold text-slate-800">{stu.name || stu.username}</td>
                        <td className="p-4 text-slate-600">{stu.email}</td>
                        <td className="p-4 text-slate-400 text-xs">
                          {new Date(stu.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/teacher/student/${stu._id}`}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                            >
                              <Eye size={14} /> View Submissions
                            </Link>
                            <button
                              onClick={() => handleRemove(stu._id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition"
                              title="Delete Student"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudents;