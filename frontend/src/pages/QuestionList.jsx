import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ListOrdered,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  BookOpen,
  CheckCircle,
  HelpCircle,
  X,
  RefreshCw
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { onRealtimeEvent } from '../utils/socket';

const QuestionList = () => {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    courseId: '',
    difficulty: 'Medium'
  });

  // Fetch courses from MongoDB
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`http://localhost:3300/api/courses`);
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  // Fetch questions from MongoDB
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (courseId && courseId !== 'all') params.courseId = courseId;
      if (searchTerm) params.search = searchTerm;

      const res = await axios.get(`http://localhost:3300/api/questions`, { params });
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchQuestions();

    const unsubscribe = onRealtimeEvent((type) => {
      if (type === 'questionAdded' || type === 'questionDeleted' || type === 'questionUpdated') {
        fetchQuestions();
        fetchCourses();
      }
    });

    return () => unsubscribe();
  }, [courseId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  // Delete question from MongoDB
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question from MongoDB?')) return;
    try {
      await axios.delete(`http://localhost:3300/api/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
      alert('Delete failed');
    }
  };

  // Open Edit Modal
  const openEditModal = (q) => {
    setEditingQuestion(q);
    setEditForm({
      questionText: q.questionText || '',
      option1: q.options?.[0] || '',
      option2: q.options?.[1] || '',
      option3: q.options?.[2] || '',
      option4: q.options?.[3] || '',
      correctAnswer: q.correctAnswer || '',
      courseId: q.courseId?._id || q.courseId || '',
      difficulty: q.difficulty || 'Medium'
    });
  };

  // Save Edit to MongoDB
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const optionsArray = [editForm.option1, editForm.option2, editForm.option3, editForm.option4]
        .map((o) => o.trim())
        .filter(Boolean);

      const payload = {
        questionText: editForm.questionText.trim(),
        options: optionsArray,
        correctAnswer: editForm.correctAnswer.trim(),
        courseId: editForm.courseId || null,
        difficulty: editForm.difficulty
      };

      const res = await axios.put(`http://localhost:3300/api/questions/${editingQuestion._id}`, payload);
      setQuestions((prev) =>
        prev.map((q) => (q._id === editingQuestion._id ? { ...q, ...res.data } : q))
      );
      setEditingQuestion(null);
      alert('Question updated in MongoDB successfully!');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update question in MongoDB');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                <ListOrdered size={32} className="text-teal-600" />
                MongoDB Question Bank
              </h1>
              <p className="text-slate-600 mt-1">
                View, search, edit, and organize all questions stored dynamically in MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchQuestions}
                className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl shadow-sm transition font-medium"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin text-teal-600' : ''} />
                Refresh
              </button>

              <Link
                to="/questions"
                className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-teal-600/20 transition active:scale-95"
              >
                <PlusCircle size={18} />
                Add Question
              </Link>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-96">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions in MongoDB..."
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

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-600">Filter Course:</span>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="p-2 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="all">All Courses ({questions.length} questions)</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <RefreshCw size={32} className="animate-spin text-teal-600 mx-auto" />
                <p className="font-medium">Fetching questions from MongoDB...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <HelpCircle size={40} className="text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-700">No questions found</h3>
                <p className="text-sm text-slate-500">
                  {courseId !== 'all'
                    ? 'No questions found for this course in MongoDB.'
                    : 'Your MongoDB question bank is currently empty.'}
                </p>
                <Link
                  to="/questions"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl mt-2 transition"
                >
                  <PlusCircle size={16} /> Add First Question
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-semibold w-12 text-center">#</th>
                      <th className="p-4 font-semibold w-1/3">Question</th>
                      <th className="p-4 font-semibold">Course</th>
                      <th className="p-4 font-semibold">Options</th>
                      <th className="p-4 font-semibold">Correct Answer</th>
                      <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map((q, idx) => (
                      <tr key={q._id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>

                        <td className="p-4 font-semibold text-slate-800 align-top">
                          <p className="line-clamp-2">{q.questionText}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                q.difficulty === 'Easy'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : q.difficulty === 'Hard'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {q.difficulty || 'Medium'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {q.marks || 1} mark(s)
                            </span>
                          </div>
                        </td>

                        <td className="p-4 align-top whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <BookOpen size={12} />
                            {q.courseId?.name || 'General'}
                          </span>
                        </td>

                        <td className="p-4 align-top">
                          <ol className="list-decimal ml-4 space-y-1 text-xs text-slate-600">
                            {(q.options || []).map((opt, i) => (
                              <li
                                key={i}
                                className={
                                  String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
                                    ? 'font-bold text-emerald-700'
                                    : ''
                                }
                              >
                                {opt}
                              </li>
                            ))}
                          </ol>
                        </td>

                        <td className="p-4 align-top whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle size={14} className="text-emerald-600" />
                            {q.correctAnswer}
                          </span>
                        </td>

                        <td className="p-4 align-top whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(q)}
                              className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg shadow-sm transition active:scale-95"
                              title="Edit question in MongoDB"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(q._id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition active:scale-95"
                              title="Delete question from MongoDB"
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

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold text-slate-800">Edit Question (MongoDB)</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={editForm.courseId}
                  onChange={(e) => setEditForm({ ...editForm, courseId: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                >
                  <option value="">-- No Course (General) --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Question Statement</label>
                <textarea
                  rows={3}
                  value={editForm.questionText}
                  onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                  className="w-full p-2.5 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Option 1</label>
                  <input
                    type="text"
                    value={editForm.option1}
                    onChange={(e) => setEditForm({ ...editForm, option1: e.target.value })}
                    className="w-full p-2 border rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Option 2</label>
                  <input
                    type="text"
                    value={editForm.option2}
                    onChange={(e) => setEditForm({ ...editForm, option2: e.target.value })}
                    className="w-full p-2 border rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Option 3</label>
                  <input
                    type="text"
                    value={editForm.option3}
                    onChange={(e) => setEditForm({ ...editForm, option3: e.target.value })}
                    className="w-full p-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Option 4</label>
                  <input
                    type="text"
                    value={editForm.option4}
                    onChange={(e) => setEditForm({ ...editForm, option4: e.target.value })}
                    className="w-full p-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer</label>
                <input
                  type="text"
                  value={editForm.correctAnswer}
                  onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                  placeholder="Exact text of the correct option"
                  className="w-full p-2.5 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20"
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

export default QuestionList;