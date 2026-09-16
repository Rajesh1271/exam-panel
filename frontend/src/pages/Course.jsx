import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, PlusCircle, Edit, Trash2, Clock, User, X, RefreshCw } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", teacher: "", duration: "", description: "" });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3300/api/courses");
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (e) => {
    e.preventDefault();
    if (!name || !teacher || !duration) {
      alert("Please fill in course name, teacher email, and duration.");
      return;
    }

    try {
      await axios.post("http://localhost:3300/api/courses", {
        name,
        teacher,
        duration,
        description
      });
      fetchCourses();
      setName("");
      setTeacher("");
      setDuration("");
      setDescription("");
      alert("Course created successfully in MongoDB!");
    } catch (err) {
      console.error("Failed to add course:", err);
      alert("Failed to add course");
    }
  };

  const startUpdate = (course) => {
    setEditingCourse(course);
    setEditForm({
      name: course.name || "",
      teacher: course.teacher || "",
      duration: course.duration || "",
      description: course.description || ""
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3300/api/courses/${editingCourse._id}`, editForm);
      setEditingCourse(null);
      fetchCourses();
      alert("Course updated in MongoDB successfully!");
    } catch (err) {
      console.error("Failed to update course:", err);
      alert("Failed to update course");
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course from MongoDB?")) return;
    try {
      await axios.delete(`http://localhost:3300/api/courses/${id}`);
      fetchCourses();
    } catch (err) {
      console.error("Failed to delete course:", err);
      alert("Failed to delete course");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                <BookOpen size={32} className="text-teal-600" />
                Manage Courses
              </h1>
              <p className="text-slate-600 mt-1">
                Create, organize, and assign teachers to courses stored in MongoDB.
              </p>
            </div>

            <button
              onClick={fetchCourses}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl shadow-sm transition font-medium"
            >
              <RefreshCw size={18} className={loading ? "animate-spin text-teal-600" : ""} />
              Refresh
            </button>
          </div>

          {/* Add Course Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PlusCircle size={20} className="text-teal-600" />
              Add New Course (MongoDB)
            </h3>

            <form onSubmit={addCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Course Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. React JS Fundamentals"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-3 border rounded-xl w-full text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Teacher / Instructor *</label>
                  <input
                    type="text"
                    placeholder="e.g. teacher@exam.com"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="p-3 border rounded-xl w-full text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duration *</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Weeks / 30 Days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="p-3 border rounded-xl w-full text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Brief summary of the course curriculum"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-3 border rounded-xl w-full text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition active:scale-95 text-sm"
              >
                Add Course to MongoDB
              </button>
            </form>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-700">All Registered Courses ({courses.length})</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading courses from MongoDB...</div>
            ) : courses.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No courses found in MongoDB.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold">Course Name</th>
                      <th className="p-4 font-semibold">Instructor</th>
                      <th className="p-4 font-semibold">Duration</th>
                      <th className="p-4 font-semibold">Created At</th>
                      <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {courses.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-semibold text-slate-800">
                          {c.name}
                          {c.description && (
                            <p className="text-xs text-slate-500 font-normal mt-0.5">{c.description}</p>
                          )}
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <User size={14} className="text-teal-600" />
                            {c.teacher}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-indigo-600" />
                            {c.duration}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs">
                          {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startUpdate(c)}
                              className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg transition"
                              title="Edit Course"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteCourse(c._id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                              title="Delete Course"
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

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Edit Course</h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Email</label>
                <input
                  type="text"
                  value={editForm.teacher}
                  onChange={(e) => setEditForm({ ...editForm, teacher: e.target.value })}
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;