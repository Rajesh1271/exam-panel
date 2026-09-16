import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  HelpCircle, 
  PlusCircle, 
  CheckCircle, 
  ListOrdered, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw,
  BookOpen,
  Sparkles,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import TeacherNavbar from '../components/TeacherNavbar';
import CourseCombobox from '../components/CourseCombobox';
import { onRealtimeEvent, broadcastLocalEvent } from '../utils/socket';
import { getSuggestions, QUESTION_CATEGORIES, SUGGESTED_QUESTIONS } from '../data/questionSuggestions';

const TeacherAddQuestion = () => {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState('0');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isOpen, setIsOpen] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestionCategory, setSuggestionCategory] = useState('all');
  const [suggestionSearch, setSuggestionSearch] = useState('');
  const [addingBatch, setAddingBatch] = useState(false);
  const [appliedSuggestionId, setAppliedSuggestionId] = useState(null);

  // Live Questions List State
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');

  const [exams, setExams] = useState([]);
  const [targetExamId, setTargetExamId] = useState('');

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await axios.get(`http://localhost:3300/api/courses`);
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
      if (list.length > 0 && !courseId) setCourseId(list[0]._id);
    } catch (err) {
      console.error('Failed to fetch courses from MongoDB', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await axios.get(`http://localhost:3300/api/exams`);
      setExams(Array.isArray(res.data) ? res.data : res.data?.exams || []);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await axios.get(`http://localhost:3300/api/questions`);
      const list = Array.isArray(res.data) ? res.data : [];
      setQuestions(list);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchExams();
    fetchQuestions();

    // Listen to real-time events across the platform
    const unsubscribe = onRealtimeEvent((type, payload) => {
      if (type === 'questionAdded' || type === 'questionDeleted' || type === 'questionUpdated') {
        fetchQuestions();
        fetchCourses();
      }
      if (type === 'examCreated' || type === 'examDeleted' || type === 'examUpdated') {
        fetchExams();
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-detect matching suggestion category when selected course changes
  const activeCourseObj = courses.find((c) => c._id === courseId);
  const currentCourseName = activeCourseObj ? activeCourseObj.name : '';

  const suggestedList = getSuggestions(
    suggestionCategory === 'all' ? currentCourseName : '',
    suggestionCategory,
    suggestionSearch
  );

  const resetForm = () => {
    setQuestionText('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOptionIndex('0');
    setDifficulty('Medium');
    setTargetExamId('');
    setAppliedSuggestionId(null);
  };

  // 1. Auto-fill form from a suggestion
  const handleSelectSuggestion = (sugg) => {
    setQuestionText(sugg.questionText);
    setOption1(sugg.options[0] || '');
    setOption2(sugg.options[1] || '');
    setOption3(sugg.options[2] || '');
    setOption4(sugg.options[3] || '');
    setDifficulty(sugg.difficulty || 'Medium');

    const correctIdx = (sugg.options || []).findIndex(
      (o) => o.trim().toLowerCase() === sugg.correctAnswer.trim().toLowerCase()
    );
    setCorrectOptionIndex(correctIdx >= 0 ? String(correctIdx) : '0');
    setAppliedSuggestionId(sugg.id);

    // Scroll smoothly to the form
    window.scrollTo({ top: 380, behavior: 'smooth' });
    setSuccessMsg(`⚡ Auto-filled question: "${sugg.questionText.substring(0, 50)}..." Edit if needed and click Save!`);
  };

  // 2. Direct 1-Click Add single suggestion to MongoDB & optional Exam
  const handleDirectAddSuggestion = async (sugg) => {
    if (!courseId) return alert('Please select or create a course first.');

    try {
      setSubmitting(true);
      const payload = {
        questionText: sugg.questionText,
        options: sugg.options,
        correctAnswer: sugg.correctAnswer,
        courseId,
        difficulty: sugg.difficulty || 'Medium',
        marks: sugg.marks || 1,
        createdBy: 'Teacher'
      };

      const res = await axios.post(`http://localhost:3300/api/questions`, payload);
      const createdQ = res.data;

      let examMsg = '';
      if (targetExamId) {
        try {
          await axios.put(`http://localhost:3300/api/exams/${targetExamId}/questions`, {
            questionId: createdQ._id
          });
          const exObj = exams.find(e => e._id === targetExamId);
          examMsg = ` and attached to "${exObj?.title || 'Exam'}"`;
        } catch (exErr) {
          console.warn('Exam attach warning:', exErr);
        }
      }

      setQuestions((prev) => [createdQ, ...prev.filter((q) => q._id !== createdQ._id)]);
      broadcastLocalEvent('questionAdded', createdQ);

      setSuccessMsg(`🎉 Suggested question saved directly to MongoDB${examMsg}!`);
      fetchQuestions();
      fetchExams();
    } catch (err) {
      console.error('Direct add suggestion error:', err);
      alert('Failed to save suggested question: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Batch 1-Click Add all suggestions in current view to MongoDB
  const handleBatchAddSuggestions = async () => {
    if (!courseId) return alert('Please select or create a course first.');
    if (suggestedList.length === 0) return alert('No suggestions available in current view.');

    if (!window.confirm(`Save all ${suggestedList.length} suggested questions to MongoDB for course "${currentCourseName || 'Current Course'}"?`)) {
      return;
    }

    try {
      setAddingBatch(true);
      const payload = {
        questions: suggestedList.map((s) => ({
          questionText: s.questionText,
          options: s.options,
          correctAnswer: s.correctAnswer,
          courseId,
          difficulty: s.difficulty || 'Medium',
          marks: s.marks || 1,
          createdBy: 'Teacher'
        })),
        targetExamId: targetExamId || undefined,
        createdBy: 'Teacher'
      };

      const res = await axios.post(`http://localhost:3300/api/questions/batch`, payload);
      const { count, exam } = res.data;

      const examMsg = exam ? ` and attached to exam "${exam.title}"` : '';
      setSuccessMsg(`🚀 Successfully batch saved ${count} questions to MongoDB${examMsg}! Realtime sync active.`);

      fetchQuestions();
      fetchCourses();
      fetchExams();
    } catch (err) {
      console.error('Batch add error:', err);
      alert('Failed to batch save questions: ' + (err.response?.data?.error || err.message));
    } finally {
      setAddingBatch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');

    if (!courseId) return alert('Please select or create a course.');
    if (!questionText.trim()) return alert('Question statement cannot be empty.');
    if (!option1.trim() || !option2.trim()) return alert('Please provide at least 2 options.');

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
        createdBy: 'Teacher'
      };

      const res = await axios.post(`http://localhost:3300/api/questions`, payload);
      const newQuestion = res.data;

      // If target exam was selected, attach question to the existing exam immediately
      let examAttachedMsg = '';
      if (targetExamId) {
        try {
          await axios.put(`http://localhost:3300/api/exams/${targetExamId}/questions`, {
            questionId: newQuestion._id
          });
          const exObj = exams.find(e => e._id === targetExamId);
          examAttachedMsg = ` and attached directly to exam "${exObj?.title || 'Exam'}"`;
        } catch (exErr) {
          console.warn('Exam attach warning:', exErr);
        }
      }

      // Update local state immediately for instant feedback
      setQuestions((prev) => [newQuestion, ...prev.filter((q) => q._id !== newQuestion._id)]);
      broadcastLocalEvent('questionAdded', newQuestion);

      setSuccessMsg(`🎉 Question saved in real-time to MongoDB${examAttachedMsg}!`);
      resetForm();
      fetchQuestions();
      fetchCourses();
      fetchExams();
    } catch (err) {
      console.error('Add question error:', err);
      alert('Failed to add question to MongoDB: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await axios.delete(`http://localhost:3300/api/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      broadcastLocalEvent('questionDeleted', { questionId: id });
    } catch (err) {
      console.error('Delete question error:', err);
      alert('Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = searchTerm.trim() === '' || 
      q.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.options?.some(o => o.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const qCourseId = q.courseId?._id || q.courseId;
    const matchesCourse = filterCourse === 'all' || qCourseId === filterCourse;
    
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <TeacherSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-gradient-to-tr from-teal-500 to-emerald-600 rounded-2xl shadow-lg shadow-teal-500/20 text-white font-black">
                  <HelpCircle size={24} />
                </span>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                  Question Management 📝
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                Add new multiple-choice questions with automatic subject suggestions and live real-time synchronization to MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <Zap size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                Live Real-Time Sync Active
              </span>
              <button
                onClick={() => { fetchCourses(); fetchQuestions(); }}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
              >
                <RefreshCw size={14} className={loadingQuestions ? "animate-spin text-teal-600" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between animate-fadeIn shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                <span>{successMsg}</span>
              </div>
              <button 
                onClick={() => setSuccessMsg('')}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SMART AUTOMATIC QUESTION SUGGESTIONS ACCORDION & DRAWER */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-teal-900/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-teal-950/40 border-2 border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/30">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h2 className="text-base font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                    ✨ Smart Question Suggestions & Verified Bank
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30">
                      {suggestedList.length} Ready
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Click any suggestion to <strong>⚡ Auto-fill</strong> or <strong>➕ 1-Click Save to MongoDB</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBatchAddSuggestions}
                  disabled={addingBatch || suggestedList.length === 0}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-indigo-600/25 transition active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
                  title="Save all matching suggested questions directly to MongoDB and attached exam"
                >
                  <Zap size={14} className="text-amber-300" />
                  {addingBatch ? "Saving to MongoDB..." : `⚡ Add All ${suggestedList.length} Suggestions`}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSuggestions((p) => !p)}
                  className="p-2 text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
                  title={showSuggestions ? "Collapse suggestions" : "Expand suggestions"}
                >
                  {showSuggestions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            {showSuggestions && (
              <div className="space-y-4 pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                {/* Category Pills & Search Filter */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {QUESTION_CATEGORIES.map((cat) => {
                      const isSelected = suggestionCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSuggestionCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative w-full md:w-56">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search suggestions..."
                      value={suggestionSearch}
                      onChange={(e) => setSuggestionSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Suggestions Grid */}
                {suggestedList.length === 0 ? (
                  <div className="p-8 text-center bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800 text-slate-500 text-xs">
                    No suggestions match the current subject filter. Try selecting "All Subjects" or searching for keywords.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {suggestedList.map((sugg) => {
                      const isApplied = appliedSuggestionId === sugg.id;
                      return (
                        <div
                          key={sugg.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                            isApplied
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-md ring-2 ring-emerald-500/20"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-md"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {sugg.courseTag}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  sugg.difficulty === 'Easy'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : sugg.difficulty === 'Hard'
                                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                }`}
                              >
                                {sugg.difficulty}
                              </span>
                            </div>

                            <p className="font-bold text-slate-800 dark:text-white text-xs leading-snug">
                              {sugg.questionText}
                            </p>

                            <div className="mt-2 space-y-1">
                              {sugg.options.map((opt, oi) => {
                                const isCorrect = opt.trim().toLowerCase() === sugg.correctAnswer.trim().toLowerCase();
                                return (
                                  <div
                                    key={oi}
                                    className={`text-[11px] px-2 py-1 rounded-lg flex items-center justify-between ${
                                      isCorrect
                                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800"
                                        : "text-slate-600 dark:text-slate-400"
                                    }`}
                                  >
                                    <span>
                                      <span className="opacity-60 font-mono mr-1">({String.fromCharCode(65 + oi)})</span>
                                      {opt}
                                    </span>
                                    {isCorrect && <Check size={12} className="text-emerald-600 flex-shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                            <button
                              type="button"
                              onClick={() => handleSelectSuggestion(sugg)}
                              className="flex-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold py-1.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1 active:scale-95"
                            >
                              <Zap size={13} className="text-amber-500" />
                              <span>Auto-Fill Form</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDirectAddSuggestion(sugg)}
                              disabled={submitting}
                              className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1 active:scale-95 disabled:opacity-60"
                            >
                              <PlusCircle size={13} />
                              <span>+ 1-Click Save</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-700/60 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PlusCircle size={20} className="text-teal-600" />
                Create New Question
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Saved questions instantly appear in the live list below and in the exam creator.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Typeable Course Combobox */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Select or Type Custom Course <span className="text-red-500">*</span>
                </label>
                <CourseCombobox
                  value={courseId}
                  onChange={(newId) => setCourseId(newId)}
                  placeholder="Search existing course or type to create custom..."
                />
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Question Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question text here (e.g. What is the difference between props and state in React?)"
                  className="w-full p-3.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white placeholder-slate-400"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Answer Options <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Option 1 (Required)</label>
                    <input
                      type="text"
                      placeholder="Option 1"
                      value={option1}
                      onChange={(e) => setOption1(e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Option 2 (Required)</label>
                    <input
                      type="text"
                      placeholder="Option 2"
                      value={option2}
                      onChange={(e) => setOption2(e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Option 3 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Option 3"
                      value={option3}
                      onChange={(e) => setOption3(e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Option 4 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Option 4"
                      value={option4}
                      onChange={(e) => setOption4(e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Correct Answer Selection, Difficulty & Optional Exam Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Select Correct Option <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={correctOptionIndex}
                    onChange={(e) => setCorrectOptionIndex(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium"
                  >
                    <option value="0">Option 1: {option1 || '(Fill Option 1)'}</option>
                    <option value="1">Option 2: {option2 || '(Fill Option 2)'}</option>
                    {option3 && <option value="2">Option 3: {option3}</option>}
                    {option4 && <option value="3">Option 4: {option4}</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Attach to Existing Exam <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={targetExamId}
                    onChange={(e) => setTargetExamId(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium"
                  >
                    <option value="">-- Don't attach to exam yet --</option>
                    {exams.map((ex) => (
                      <option key={ex._id} value={ex._id}>
                        {ex.title || ex.examname} ({ex.questionIds?.length || 0} Qs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-teal-600/25 transition active:scale-95 text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  <PlusCircle size={18} />
                  {submitting ? 'Saving to MongoDB...' : 'Save Question to MongoDB'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm transition"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>

          {/* Live Questions Bank Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <ListOrdered size={20} className="text-teal-600" />
                  Live MongoDB Question Bank
                  <span className="text-xs bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold px-2.5 py-0.5 rounded-full border border-teal-500/20">
                    {filteredQuestions.length} Questions
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Updates in real-time as questions are added, modified, or removed.
                </p>
              </div>

              {/* Filter and Search Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-60">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search question text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Courses</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loadingQuestions ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <RefreshCw size={28} className="animate-spin text-teal-600 mx-auto" />
                <p className="text-xs font-semibold">Loading questions from MongoDB...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <HelpCircle size={40} className="text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">No questions found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchTerm || filterCourse !== 'all' 
                    ? 'No questions match the selected search or filter.' 
                    : 'Fill the form above to add your first question.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 pl-6 w-12 text-center">#</th>
                      <th className="p-4 w-2/5">Question Statement</th>
                      <th className="p-4">Course</th>
                      <th className="p-4">Options</th>
                      <th className="p-4">Correct Answer</th>
                      <th className="p-4 pr-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredQuestions.map((q, idx) => {
                      const courseTitle = q.courseId?.name || courses.find(c => c._id === (q.courseId?._id || q.courseId))?.name || "General";
                      
                      return (
                        <tr key={q._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="p-4 pl-6 text-center font-mono text-xs text-slate-400">
                            {idx + 1}
                          </td>

                          <td className="p-4 align-top">
                            <p className="font-bold text-slate-800 dark:text-white text-sm">
                              {q.questionText}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  q.difficulty === 'Easy'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : q.difficulty === 'Hard'
                                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                }`}
                              >
                                {q.difficulty || 'Medium'}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {q.marks || 1} mark(s)
                              </span>
                            </div>
                          </td>

                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                              <BookOpen size={12} />
                              {courseTitle}
                            </span>
                          </td>

                          <td className="p-4 align-top text-xs text-slate-600 dark:text-slate-300">
                            <ul className="space-y-1">
                              {(q.options || []).map((opt, oi) => {
                                const isCorrect = String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                                return (
                                  <li 
                                    key={oi} 
                                    className={`flex items-center gap-1.5 ${isCorrect ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}`}
                                  >
                                    <span className="text-[10px] opacity-60 font-mono">({String.fromCharCode(65 + oi)})</span>
                                    <span>{opt}</span>
                                    {isCorrect && <CheckCircle size={12} className="inline flex-shrink-0" />}
                                  </li>
                                );
                              })}
                            </ul>
                          </td>

                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle size={12} />
                              {q.correctAnswer}
                            </span>
                          </td>

                          <td className="p-4 pr-6 align-top text-center">
                            <button
                              onClick={() => handleDelete(q._id)}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                              title="Delete Question"
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
};

export default TeacherAddQuestion;
