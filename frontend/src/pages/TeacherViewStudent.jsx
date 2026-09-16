import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Award, Clock, FileText, CheckCircle, XCircle, ChevronDown, ChevronUp, CheckCheck } from "lucide-react";

const TeacherViewStudent = () => {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedResultId, setExpandedResultId] = useState(null);

  useEffect(() => {
    loadStudentResults();
  }, [id]);

  const loadStudentResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3300/api/results/student/${id}`);
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Error fetching results from MongoDB:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (resId) => {
    setExpandedResultId(prev => prev === resId ? null : resId);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/teacher-students"
          className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm hover:underline"
        >
          <ArrowLeft size={16} /> Back to Students Directory
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Student Exam Results</h1>
          <p className="text-slate-600 mt-1">
            Exam submissions and grading history permanently stored in MongoDB for Student ID: {id}
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm">
            Loading student results from MongoDB...
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
            <Award size={48} className="text-slate-300 mx-auto" />
            <h3 className="text-xl font-bold text-slate-700">No Submissions Found</h3>
            <p className="text-slate-500 text-sm">This student has not submitted any exam answers yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((r) => {
              const max = r.maxScore || 1;
              const pct = r.percentage || Math.round((r.score / max) * 100);
              const isPassed = pct >= 40;
              const isExpanded = expandedResultId === r._id;

              return (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                        MongoDB Record
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 mt-1">
                        {r.exam?.title || r.exam?.examname || "Online Exam"}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        Submitted on: {new Date(r.submittedAt || r.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-semibold uppercase">Score</span>
                        <p className="text-2xl font-black text-slate-800">{r.score} / {r.maxScore}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-semibold uppercase">Grade</span>
                        <p className={`text-2xl font-black ${isPassed ? "text-emerald-600" : "text-rose-600"}`}>
                          {pct}%
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isPassed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isPassed ? "Passed" : "Failed"}
                      </span>

                      {r.answers && r.answers.length > 0 && (
                        <button
                          onClick={() => toggleExpand(r._id)}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition"
                        >
                          <span>{isExpanded ? "Hide Details" : "View Answers"}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Answers Breakdown Drawer */}
                  {isExpanded && r.answers && r.answers.length > 0 && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Detailed Answer Submissions ({r.answers.length} Questions)
                      </h4>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {r.answers.map((ans, idx) => (
                          <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs">
                            <p className="font-bold text-slate-800">
                              {idx + 1}. {ans.questionText || ans.questionId?.questionText || `Question #${idx + 1}`}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className={`px-2 py-0.5 rounded font-semibold ${ans.correct ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                                Student Answer: {ans.selectedOption || "Not Answered"}
                              </span>
                              {!ans.correct && (ans.correctAnswer || ans.questionId?.correctAnswer) && (
                                <span className="px-2 py-0.5 rounded font-semibold bg-teal-100 text-teal-800">
                                  Correct Answer: {ans.correctAnswer || ans.questionId?.correctAnswer}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherViewStudent;