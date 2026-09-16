// src/pages/CreateExam.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BookOpen, 
  PlusCircle, 
  CheckSquare, 
  Square, 
  Clock, 
  Calendar, 
  HelpCircle, 
  FileText, 
  CheckCircle,
  Sparkles,
  Zap,
  Check
} from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar";
import TeacherNavbar from "../components/TeacherNavbar";
import CourseCombobox from "../components/CourseCombobox";
import { onRealtimeEvent } from "../utils/socket";
import { getSuggestions } from "../data/questionSuggestions";

const CreateExam = () => {
  const [isOpen, setIsOpen] = useState(true);

  const [title, setTitle] = useState("");
  const [examcode, setExamcode] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("10:00 AM");
  const [duration, setDuration] = useState("30");
  const [passMarks, setPassMarks] = useState("40");

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Inline question state
  const [newQText, setNewQText] = useState("");
  const [newQOpt1, setNewQOpt1] = useState("");
  const [newQOpt2, setNewQOpt2] = useState("");
  const [newQOpt3, setNewQOpt3] = useState("");
  const [newQOpt4, setNewQOpt4] = useState("");
  const [newQCorrect, setNewQCorrect] = useState("");
  const [showInlineAdd, setShowInlineAdd] = useState(false);

  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const activeCourseName = courses.find((c) => c._id === courseId)?.name || "";
  const suggestedList = getSuggestions(activeCourseName, "all");

  const handleAddSuggestedQuestionToExam = async (sugg) => {
    if (!courseId) return alert("Please select or create a course first.");
    try {
      const payload = {
        questionText: sugg.questionText,
        options: sugg.options,
        correctAnswer: sugg.correctAnswer,
        courseId: courseId || null,
        difficulty: sugg.difficulty || "Medium",
        marks: sugg.marks || 1,
        createdBy: "Teacher"
      };
      const res = await axios.post("http://localhost:3300/api/questions", payload);
      const created = res.data;
      setAvailableQuestions((prev) => [created, ...prev]);
      setSelectedQuestionIds((prev) => Array.from(new Set([...prev, created._id])));
    } catch (err) {
      console.error("Add suggested question failed:", err);
      alert("Failed to add question to MongoDB");
    }
  };

  const handleAddAllSuggestionsToExam = async () => {
    if (!courseId) return alert("Please select or create a course first.");
    if (suggestedList.length === 0) return alert("No suggestions available for this course.");

    try {
      const payload = {
        questions: suggestedList.map((s) => ({
          questionText: s.questionText,
          options: s.options,
          correctAnswer: s.correctAnswer,
          courseId,
          difficulty: s.difficulty || "Medium",
          marks: s.marks || 1,
          createdBy: "Teacher"
        })),
        createdBy: "Teacher"
      };
      const res = await axios.post("http://localhost:3300/api/questions/batch", payload);
      const { questions: createdQuestions } = res.data;
      setAvailableQuestions((prev) => [...createdQuestions, ...prev]);
      const newIds = createdQuestions.map((q) => q._id);
      setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...newIds])));
      alert(`🎉 Added and selected ${createdQuestions.length} suggested questions for this exam!`);
    } catch (err) {
      console.error("Batch add suggestions error:", err);
      alert("Failed to add suggestions: " + (err.response?.data?.error || err.message));
    }
  };

  const loadCourses = async () => {
    try {
      const res = await axios.get("http://localhost:3300/api/courses");
      const arr = Array.isArray(res.data) ? res.data : [];
      setCourses(arr);
      if (arr.length > 0 && !courseId) {
        setCourseId(arr[0]._id);
        setTitle(`${arr[0].name} Final Exam`);
        setExamcode(`${arr[0].name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const url = showAllQuestions || !courseId 
        ? "http://localhost:3300/api/questions" 
        : `http://localhost:3300/api/questions?courseId=${courseId}`;
      const res = await axios.get(url);
      const list = Array.isArray(res.data) ? res.data : [];
      setAvailableQuestions(list);
      // Auto-select questions
      setSelectedQuestionIds((prev) => {
        const newIds = list.map((q) => q._id);
        return Array.from(new Set([...prev, ...newIds]));
      });
    } catch (err) {
      console.error("Failed to load questions from MongoDB:", err);
      setAvailableQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Load questions from MongoDB when course changes & subscribe to real-time events
  useEffect(() => {
    loadQuestions();

    const unsubscribe = onRealtimeEvent((type) => {
      if (type === "questionAdded" || type === "questionDeleted" || type === "questionUpdated") {
        loadQuestions();
      }
    });

    return () => unsubscribe();
  }, [courseId, showAllQuestions]);

  const handleCourseChange = (id, courseObj) => {
    setCourseId(id);
    const courseName = courseObj?.name || courses.find((c) => c._id === id)?.name || "Course";
    setTitle(`${courseName} Assessment`);
    setExamcode(`${courseName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`);
  };

  const handleAddNewQuestionInline = async (e) => {
    e.preventDefault();
    if (!newQText.trim() || !newQOpt1.trim() || !newQOpt2.trim() || !newQCorrect.trim()) {
      alert("Please fill question text, at least two options, and correct answer.");
      return;
    }

    const options = [newQOpt1, newQOpt2, newQOpt3, newQOpt4].map(o => o.trim()).filter(Boolean);

    const payload = {
      questionText: newQText.trim(),
      options,
      correctAnswer: newQCorrect.trim(),
      courseId: courseId || null,
      createdBy: "Teacher"
    };

    try {
      const res = await axios.post("http://localhost:3300/api/questions", payload);
      const created = res.data;
      setAvailableQuestions((prev) => [created, ...prev]);
      setSelectedQuestionIds((prev) => [...prev, created._id]);
      setNewQText("");
      setNewQOpt1("");
      setNewQOpt2("");
      setNewQOpt3("");
      setNewQOpt4("");
      setNewQCorrect("");
      setShowInlineAdd(false);
      alert("Question saved to MongoDB and included in this exam!");
    } catch (err) {
      console.error("Inline add question failed:", err);
      alert("Failed to add question to MongoDB");
    }
  };

  const toggleQuestion = (qid) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qid) ? prev.filter((x) => x !== qid) : [...prev, qid]
    );
  };

  const toggleSelectAll = () => {
    if (selectedQuestionIds.length === availableQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(availableQuestions.map((q) => q._id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) return alert("Please select or create a course.");
    if (!title.trim()) return alert("Please enter an exam title.");
    if (selectedQuestionIds.length === 0) {
      return alert("Please pick at least one question for this exam from MongoDB.");
    }

    const payload = {
      title: title.trim(),
      examname: title.trim(),
      examcode: examcode.trim() || `EX-${Date.now().toString().slice(-4)}`,
      courseId,
      questionIds: selectedQuestionIds,
      durationMinutes: Number(duration) || 30,
      totalMarks: selectedQuestionIds.length,
      passMarks: Math.ceil(selectedQuestionIds.length * (Number(passMarks) / 100 || 0.4)),
      date,
      starttime: startTime
    };

    try {
      setSubmitting(true);
      await axios.post("http://localhost:3300/api/exams", payload);
      alert("🎉 Exam created and synchronized to MongoDB successfully!");
      setTitle("");
      setExamcode("");
    } catch (err) {
      console.error("Create exam error:", err);
      alert("Failed to create exam: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <TeacherSidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} />

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
              <FileText size={32} className="text-teal-600" />
              Create New Exam (MongoDB)
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Select questions from the MongoDB question bank or add new questions to publish an exam. Search or type any custom course.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-4xl transition-colors">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Typeable Course Combobox */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Select or Type Custom Course <span className="text-red-500">*</span>
                </label>
                <CourseCombobox
                  value={courseId}
                  onChange={(id, courseObj) => handleCourseChange(id, courseObj)}
                  placeholder="Search existing course or type to add custom..."
                />
              </div>

              {/* Title & Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Exam Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. React Fundamentals Exam"
                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Code</label>
                  <input
                    type="text"
                    value={examcode}
                    onChange={(e) => setExamcode(e.target.value)}
                    placeholder="e.g. REACT-101"
                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Timing & Marks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                    min="5"
                    max="180"
                  />
                </div>
              </div>

              {/* Questions Picker from MongoDB */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle size={18} className="text-teal-600" />
                    Select Questions from MongoDB ({selectedQuestionIds.length} / {availableQuestions.length} selected)
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSuggestions((prev) => !prev)}
                      className="text-xs px-2.5 py-1 rounded-lg font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 hover:bg-indigo-100 transition"
                    >
                      <Sparkles size={13} className="text-amber-500" />
                      {showSuggestions ? "Hide Suggestions" : `✨ Suggestions (${suggestedList.length})`}
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setShowAllQuestions((prev) => !prev)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
                        showAllQuestions 
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" 
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {showAllQuestions ? "📂 Showing All Questions" : "🎯 Filter by Course"}
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                    >
                      {selectedQuestionIds.length === availableQuestions.length ? "Deselect All" : "Select All"}
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setShowInlineAdd(!showInlineAdd)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <PlusCircle size={14} />
                      {showInlineAdd ? "Cancel New Question" : "Add Question to MongoDB"}
                    </button>
                  </div>
                </div>

                {/* Suggestions Quick Drawer */}
                {showSuggestions && (
                  <div className="mb-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-indigo-600" />
                        Suggested Questions for {activeCourseName || "Course"} ({suggestedList.length})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddAllSuggestionsToExam}
                        className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg shadow-sm flex items-center gap-1"
                      >
                        <Zap size={12} className="text-amber-300" />
                        + Add All {suggestedList.length} to Exam
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {suggestedList.map((sugg) => {
                        const isAlreadyAdded = availableQuestions.some((q) => q.questionText === sugg.questionText);
                        return (
                          <div
                            key={sugg.id}
                            className="p-3 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-xl space-y-1.5 text-xs shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-800 dark:text-white line-clamp-1">{sugg.questionText}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {sugg.difficulty}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-600 font-medium">✓ {sugg.correctAnswer}</p>
                            <div className="pt-1 flex justify-end">
                              <button
                                type="button"
                                disabled={isAlreadyAdded}
                                onClick={() => handleAddSuggestedQuestionToExam(sugg)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                                  isAlreadyAdded
                                    ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default"
                                    : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs active:scale-95"
                                }`}
                              >
                                {isAlreadyAdded ? "✓ Added to Bank" : "+ Add to Exam"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {loadingQuestions ? (
                  <div className="p-8 text-center text-slate-500 border rounded-2xl bg-slate-50">
                    Loading questions from MongoDB...
                  </div>
                ) : availableQuestions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 border rounded-2xl bg-slate-50 space-y-2">
                    <p>No questions found in MongoDB for this course.</p>
                    <button
                      type="button"
                      onClick={() => setShowInlineAdd(true)}
                      className="text-sm font-bold text-teal-600 hover:underline"
                    >
                      + Add the first question now
                    </button>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl p-4 bg-slate-50/50 divide-y divide-slate-100">
                    {availableQuestions.map((q, idx) => {
                      const isChecked = selectedQuestionIds.includes(q._id);
                      return (
                        <div
                          key={q._id}
                          onClick={() => toggleQuestion(q._id)}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${
                            isChecked ? "bg-teal-50 border border-teal-200" : "hover:bg-white"
                          }`}
                        >
                          <div className="mt-0.5 text-teal-600">
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                              {idx + 1}. {q.questionText}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span>Options: {q.options?.join(", ")}</span>
                              <span className="text-emerald-600 font-bold">Answer: {q.correctAnswer}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Inline Add Question Form */}
              {showInlineAdd && (
                <div className="bg-indigo-50/50 border border-indigo-200 p-6 rounded-2xl space-y-4">
                  <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                    <PlusCircle size={16} />
                    Add Question Directly into MongoDB & Include in Exam
                  </h4>

                  <div>
                    <input
                      type="text"
                      placeholder="Question statement"
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-sm bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Option 1"
                      value={newQOpt1}
                      onChange={(e) => setNewQOpt1(e.target.value)}
                      className="p-2 border rounded-xl text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Option 2"
                      value={newQOpt2}
                      onChange={(e) => setNewQOpt2(e.target.value)}
                      className="p-2 border rounded-xl text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Option 3"
                      value={newQOpt3}
                      onChange={(e) => setNewQOpt3(e.target.value)}
                      className="p-2 border rounded-xl text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Option 4"
                      value={newQOpt4}
                      onChange={(e) => setNewQOpt4(e.target.value)}
                      className="p-2 border rounded-xl text-sm bg-white"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Exact correct answer option text"
                      value={newQCorrect}
                      onChange={(e) => setNewQCorrect(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-sm bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewQuestionInline}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow"
                  >
                    Save to MongoDB & Auto-Select
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-teal-600/25 transition active:scale-95 text-base flex items-center gap-2"
                >
                  <CheckCircle size={20} />
                  {submitting ? "Publishing Exam..." : "Publish Exam to MongoDB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;