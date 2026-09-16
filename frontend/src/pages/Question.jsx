import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HelpCircle, PlusCircle, CheckCircle, ListOrdered, BookOpen, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import CourseCombobox from '../components/CourseCombobox';
import { broadcastLocalEvent } from '../utils/socket';

const Question = () => {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState('0');
  const [difficulty, setDifficulty] = useState('Medium');
  const [marks, setMarks] = useState(1);
  const [isOpen, setIsOpen] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  // Fetch courses from MongoDB
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await axios.get(`http://localhost:3300/api/courses`);
      const courseList = Array.isArray(res.data) ? res.data : [];
      setCourses(courseList);
      if (courseList.length > 0 && !courseId) {
        setCourseId(courseList[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch courses from MongoDB', err);
      setErrorMsg('Failed to load courses from MongoDB.');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const resetForm = () => {
    setQuestionText('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOptionIndex('0');
    setDifficulty('Medium');
    setMarks(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!courseId) {
      setErrorMsg('Please select or create a course for this question.');
      return;
    }
    if (!questionText.trim()) {
      setErrorMsg('Question text is required.');
      return;
    }
    if (!option1.trim() || !option2.trim()) {
      setErrorMsg('Please enter at least Option 1 and Option 2.');
      return;
    }

    const optionsArray = [option1.trim(), option2.trim(), option3.trim(), option4.trim()].filter(Boolean);
    const selectedIdx = parseInt(correctOptionIndex, 10);
    const chosenCorrectAnswer = optionsArray[selectedIdx] || optionsArray[0];

    try {
      setSubmitting(true);
      const payload = {
        questionText: questionText.trim(),
        options: optionsArray,
        correctAnswer: chosenCorrectAnswer,
        courseId,
        difficulty,
        marks: Number(marks) || 1,
        createdBy: 'Admin'
      };

      const res = await axios.post(`http://localhost:3300/api/questions`, payload);
      broadcastLocalEvent('questionAdded', res.data);
      setSuccessMsg(`✅ Question added and synchronized to MongoDB successfully! (ID: ${res.data._id})`);
      resetForm();
    } catch (err) {
      console.error('Add question error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to save question to MongoDB.');
    } finally {
      setSubmitting(false);
    }
  };

  const optionsList = [option1, option2, option3, option4].filter(Boolean);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <AdminSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                <HelpCircle size={32} className="text-teal-600" />
                Add Question to MongoDB
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Create new multiple-choice questions stored directly in the MongoDB question bank. Select or type any custom course.
              </p>
            </div>

            <Link
              to="/questions-list"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl shadow-sm transition font-medium"
            >
              <ListOrdered size={18} className="text-teal-600" />
              View Question Bank
            </Link>
          </div>

          {/* Feedback Alerts */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span className="font-medium">{successMsg}</span>
              <Link to="/questions-list" className="underline text-sm font-semibold hover:text-emerald-900">
                View in Bank →
              </Link>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-4xl transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Selection via Typeable Combobox */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Select or Type Custom Course / Subject <span className="text-red-500">*</span>
                </label>
                <CourseCombobox
                  value={courseId}
                  onChange={(newId) => setCourseId(newId)}
                  placeholder="Search existing course or type to add custom..."
                />
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Question Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question text here (e.g. What is the difference between state and props in React?)"
                  className="w-full p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                  required
                />
              </div>

              {/* Options Grid */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Answer Options <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Option A (Required)</label>
                    <input
                      type="text"
                      placeholder="Option 1"
                      value={option1}
                      onChange={(e) => setOption1(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Option B (Required)</label>
                    <input
                      type="text"
                      placeholder="Option 2"
                      value={option2}
                      onChange={(e) => setOption2(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Option C (Optional)</label>
                    <input
                      type="text"
                      placeholder="Option 3"
                      value={option3}
                      onChange={(e) => setOption3(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Option D (Optional)</label>
                    <input
                      type="text"
                      placeholder="Option 4"
                      value={option4}
                      onChange={(e) => setOption4(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Correct Answer & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Correct Option <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={correctOptionIndex}
                    onChange={(e) => setCorrectOptionIndex(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm font-medium"
                  >
                    <option value="0">Option A: {option1 || '(Fill Option 1)'}</option>
                    <option value="1">Option B: {option2 || '(Fill Option 2)'}</option>
                    {option3 && <option value="2">Option C: {option3}</option>}
                    {option4 && <option value="3">Option D: {option4}</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Marks</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-600/25 transition active:scale-95 disabled:opacity-60 flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  {submitting ? 'Saving to MongoDB...' : 'Save Question to MongoDB'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium text-sm transition"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;