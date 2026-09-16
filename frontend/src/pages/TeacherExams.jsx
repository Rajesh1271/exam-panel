import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Book,
  PlusCircle,
  Clock,
  FileText,
  Trash2,
  Eye,
  RefreshCw,
  Award,
  AlertCircle,
  Calendar,
  CheckCircle,
  Edit3,
  Sliders,
  Save,
  Check,
  X
} from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar";
import { onRealtimeEvent } from "../utils/socket";

export default function TeacherExams() {
  const [isOpen, setIsOpen] = useState(true);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Question modal states
  const [selectedExam, setSelectedExam] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [examDetails, setExamDetails] = useState(null);

  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionToAdd, setSelectedQuestionToAdd] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);

  // Edit Duration & Settings modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    examcode: "",
    durationMinutes: 30,
    passMarks: 40,
    date: "",
    starttime: "10:00 AM"
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const durationPresets = [10, 15, 20, 30, 45, 60, 90, 120, 180];

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3300/api/exams");
      const list = Array.isArray(res.data) ? res.data : res.data?.exams || [];
      setExams(list);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:3300/api/questions");
      setAllQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchAllQuestions();

    // Listen to real-time events
    const unsubscribe = onRealtimeEvent((type) => {
      if (
        type === "examCreated" || 
        type === "examDeleted" || 
        type === "examUpdated" || 
        type === "questionAdded" || 
        type === "questionDeleted" || 
        type === "questionUpdated"
      ) {
        fetchExams();
        fetchAllQuestions();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the exam "${title}"?`)) return;

    try {
      await axios.delete(`http://localhost:3300/api/exams/${id}`);
      setExams((prev) => prev.filter((e) => e._id !== id));
      alert("Exam deleted successfully from MongoDB!");
    } catch (err) {
      console.error("Failed to delete exam:", err);
      alert("Error deleting exam. Please try again.");
    }
  };

  const handleOpenEditModal = (exam) => {
    setEditingExam(exam);
    setEditForm({
      title: exam.title || exam.examname || "",
      examcode: exam.examcode || "",
      durationMinutes: Number(exam.durationMinutes || exam.duration || 30),
      passMarks: Number(exam.passMarks || 40),
      date: exam.date || new Date().toISOString().split('T')[0],
      starttime: exam.starttime || "10:00 AM"
    });
    setSuccessMessage("");
    setEditModalOpen(true);
  };

  const handleSaveExamSettings = async (e) => {
    e.preventDefault();
    if (!editingExam) return;

    try {
      setSavingSettings(true);
      const payload = {
        title: editForm.title.trim(),
        examname: editForm.title.trim(),
        examcode: editForm.examcode.trim(),
        durationMinutes: Math.max(1, Number(editForm.durationMinutes) || 30),
        duration: Math.max(1, Number(editForm.durationMinutes) || 30),
        passMarks: Number(editForm.passMarks) || 40,
        date: editForm.date,
        starttime: editForm.starttime
      };

      const res = await axios.put(`http://localhost:3300/api/exams/${editingExam._id}`, payload);
      
      setSuccessMessage(`🎉 Exam duration updated to ${payload.durationMinutes} minutes successfully!`);
      fetchExams();

      if (selectedExam && selectedExam._id === editingExam._id) {
        setSelectedExam(res.data);
      }

      setTimeout(() => {
        setEditModalOpen(false);
        setEditingExam(null);
        setSuccessMessage("");
      }, 1200);

    } catch (err) {
      console.error("Failed to update exam duration:", err);
      alert("Failed to update exam: " + (err.response?.data?.error || err.message));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleViewDetails = async (exam) => {
    setSelectedExam(exam);
    try {
      setDetailsLoading(true);
      const res = await axios.get(`http://localhost:3300/api/exams/${exam._id}`);
      setExamDetails(res.data);
    } catch (err) {
      console.error("Error fetching exam details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddQuestionToExam = async (examId, qId) => {
    if (!qId) return alert("Please select a question to add.");
    try {
      setAddingQuestion(true);
      const res = await axios.put(`http://localhost:3300/api/exams/${examId}/questions`, {
        questionId: qId
      });
      setExamDetails(res.data);
      setSelectedQuestionToAdd("");
      fetchExams();
      alert("🎉 Question added to exam successfully!");
    } catch (err) {
      console.error("Failed to add question to exam:", err);
      alert("Failed to add question: " + (err.response?.data?.error || err.message));
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleAddAllCourseQuestions = async (exam) => {
    const courseId = exam.courseId?._id || exam.courseId || exam.course?._id || exam.course;
    const matching = allQuestions.filter(q => {
      const qcId = q.courseId?._id || q.courseId;
      return qcId === courseId;
    });

    if (matching.length === 0) {
      return alert("No additional questions found for this course in the question bank.");
    }

    const qIds = matching.map(q => q._id);
    try {
      setAddingQuestion(true);
      const res = await axios.put(`http://localhost:3300/api/exams/${exam._id}/questions`, {
        questionIds: qIds
      });
      setExamDetails(res.data);
      fetchExams();
      alert(`🎉 Added ${qIds.length} course question(s) to this exam!`);
    } catch (err) {
      console.error("Failed to bulk add questions:", err);
      alert("Failed to add questions: " + (err.response?.data?.error || err.message));
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleRemoveQuestionFromExam = async (examId, qId) => {
    if (!window.confirm("Remove this question from this exam?")) return;
    try {
      const res = await axios.put(`http://localhost:3300/api/exams/${examId}/remove-question`, {
        questionId: qId
      });
      setExamDetails(res.data);
      fetchExams();
    } catch (err) {
      console.error("Failed to remove question:", err);
      alert("Failed to remove question: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30">
      <TeacherSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"} p-6 md:p-8 space-y-8`}>
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white font-black">
                <Book size={24} />
              </span>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Examinations Management 📋
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Create, adjust duration limits, inspect, and manage active tests for all registered students.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/teacher-create-exam"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-blue-500/20 transition active:scale-95"
            >
              <PlusCircle size={18} />
              <span>Create New Exam</span>
            </Link>

            <button
              onClick={fetchExams}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm active:scale-95"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Published Exams</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{exams.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Live in MongoDB database</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Book size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Questions Linked</p>
              <h3 className="text-3xl font-black text-indigo-600 mt-1">
                {exams.reduce((acc, ex) => acc + (ex.questionCount || ex.questionIds?.length || 0), 0)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Assigned across all tests</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Standard Pass Criteria</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">40%</h3>
              <p className="text-xs text-slate-500 mt-1">Minimum passing score</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award size={28} />
            </div>
          </div>
        </div>

        {/* Exams Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Book size={20} className="text-blue-600" />
              Published Examinations List
            </h2>
            <span className="text-xs font-semibold text-slate-500">{exams.length} Exams in Total</span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto" />
              <p className="text-sm font-semibold">Loading exams from database...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <AlertCircle size={48} className="mx-auto text-slate-300" />
              <h3 className="text-xl font-bold text-slate-700">No Exams Published Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Get started by creating your first online examination with questions from your question bank.
              </p>
              <Link
                to="/teacher-create-exam"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition"
              >
                <PlusCircle size={18} />
                <span>Create Exam</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Exam Title</th>
                    <th className="p-4">Course / Subject</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Questions</th>
                    <th className="p-4">Pass Marks</th>
                    <th className="p-4 text-center pr-6">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {exams.map((ex) => {
                    const qCount = ex.questionCount || ex.questionIds?.length || 0;
                    const durationVal = ex.durationMinutes || ex.duration || 30;

                    return (
                      <tr key={ex._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 pl-6 font-bold text-slate-800">
                          {ex.title || ex.examname}
                          {ex.examcode && (
                            <span className="block font-mono text-[11px] font-normal text-slate-400">
                              Code: {ex.examcode}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                            {ex.course?.name || ex.course?.coursename || "General"}
                          </span>
                        </td>

                        <td className="p-4 text-slate-700 font-bold">
                          <button
                            onClick={() => handleOpenEditModal(ex)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 transition"
                            title="Click to edit duration"
                          >
                            <Clock size={14} className="text-amber-600" />
                            <span>{durationVal} Mins</span>
                            <Edit3 size={11} className="text-amber-500 ml-0.5" />
                          </button>
                        </td>

                        <td className="p-4 text-slate-700 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <FileText size={14} className="text-indigo-600" />
                            {qCount} Questions
                          </span>
                        </td>

                        <td className="p-4 text-slate-600">
                          <span className="font-semibold text-emerald-700">{ex.passMarks || 40}%</span>
                        </td>

                        <td className="p-4 pr-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(ex)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition text-xs font-bold border border-amber-200"
                              title="Edit Exam Duration & Settings"
                            >
                              <Sliders size={14} />
                              <span>Edit Duration</span>
                            </button>

                            <button
                              onClick={() => handleViewDetails(ex)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition text-xs font-semibold"
                              title="Manage & Add Questions to this Exam"
                            >
                              <PlusCircle size={15} />
                              <span>Manage Qs</span>
                            </button>

                            <button
                              onClick={() => handleViewDetails(ex)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="View Exam Details"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(ex._id, ex.title || ex.examname)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Exam"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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

      {/* Edit Exam Duration & Settings Modal */}
      {editModalOpen && editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Clock size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    Change Exam Duration & Settings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust time limits and exam parameters in MongoDB
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExamSettings} className="p-6 space-y-5">
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Exam Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exam Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* Exam Duration Limit in Minutes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-600" />
                    Exam Duration (Minutes) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {editForm.durationMinutes} Minutes ({Math.floor(editForm.durationMinutes / 60)}h {editForm.durationMinutes % 60}m)
                  </span>
                </div>

                <input
                  type="number"
                  min="1"
                  max="480"
                  value={editForm.durationMinutes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, durationMinutes: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />

                {/* Quick Duration Preset Pills */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Quick Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {durationPresets.map((mins) => {
                      const isSelected = Number(editForm.durationMinutes) === mins;
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, durationMinutes: mins }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                            isSelected
                              ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-400"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {mins < 60 ? `${mins}m` : mins === 60 ? '1h' : `${mins / 60}h`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Code & Pass Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Exam Code
                  </label>
                  <input
                    type="text"
                    value={editForm.examcode}
                    onChange={(e) => setEditForm(prev => ({ ...prev, examcode: e.target.value }))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pass Criteria (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editForm.passMarks}
                    onChange={(e) => setEditForm(prev => ({ ...prev, passMarks: Math.min(100, Math.max(1, parseInt(e.target.value) || 40)) }))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center gap-2"
                >
                  <Save size={15} />
                  <span>{savingSettings ? "Saving Duration..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Details & Questions Management Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <FileText size={22} className="text-blue-600" />
                  {selectedExam.title || selectedExam.examname}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Course: <strong className="text-blue-600">{selectedExam.course?.name || "General"}</strong></span>
                  <span>•</span>
                  <button
                    onClick={() => handleOpenEditModal(selectedExam)}
                    className="inline-flex items-center gap-1 font-bold text-amber-700 hover:underline bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                  >
                    <Clock size={12} />
                    <span>Duration: {selectedExam.durationMinutes || 30} Mins (Click to change)</span>
                  </button>
                  <span>•</span>
                  <span>{examDetails?.questionIds?.length || 0} Questions</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedExam(null);
                  setExamDetails(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Add Question to Existing Exam Section */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <PlusCircle size={16} className="text-indigo-600" />
                  Add Question from Question Bank to this Exam
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedQuestionToAdd}
                    onChange={(e) => setSelectedQuestionToAdd(e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose question from question bank to add --</option>
                    {allQuestions
                      .filter((q) => !examDetails?.questionIds?.some((eq) => eq._id === q._id || eq === q._id))
                      .map((q) => (
                        <option key={q._id} value={q._id}>
                          [{q.courseId?.name || "General"}] {q.questionText.substring(0, 60)}...
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    disabled={!selectedQuestionToAdd || addingQuestion}
                    onClick={() => handleAddQuestionToExam(selectedExam._id, selectedQuestionToAdd)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={14} />
                    <span>+ Add to Exam</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Quick bulk action:
                  </span>
                  <button
                    type="button"
                    disabled={addingQuestion}
                    onClick={() => handleAddAllCourseQuestions(selectedExam)}
                    className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
                  >
                    <span>⚡ + Add All Questions for this Course</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {detailsLoading ? (
                <div className="p-12 text-center text-slate-400">Loading questions from MongoDB...</div>
              ) : examDetails?.questionIds?.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Currently Included Questions ({examDetails.questionIds.length}):
                    </h4>
                    <span className="text-[11px] text-emerald-600 font-bold">Live in Exam</span>
                  </div>

                  {examDetails.questionIds.map((q, idx) => (
                    <div key={q._id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-800 flex-1">
                          {idx + 1}. {q.questionText}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFromExam(selectedExam._id, q._id)}
                          className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-md transition text-[11px] font-bold flex items-center gap-1"
                          title="Remove question from exam"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-600 pl-4">
                        {(q.options || []).map((opt, oi) => (
                          <div
                            key={oi}
                            className={`p-2 rounded-lg border ${
                              opt === q.correctAnswer
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            {String.fromCharCode(65 + oi)}. {opt} {opt === q.correctAnswer && "✓"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <HelpCircle size={36} className="mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-700">No questions currently linked to this exam.</p>
                  <p className="text-xs text-slate-400">Use the selector above or click 'Add All Questions' to populate questions.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleOpenEditModal(selectedExam)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition"
              >
                <Clock size={14} className="text-amber-600" />
                <span>Edit Duration ({selectedExam.durationMinutes || 30}m)</span>
              </button>

              <button
                onClick={() => {
                  setSelectedExam(null);
                  setExamDetails(null);
                }}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

