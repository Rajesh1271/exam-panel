// src/components/CourseCombobox.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BookOpen, Check, ChevronsUpDown, Plus, Search, Sparkles } from "lucide-react";

export default function CourseCombobox({
  value,
  onChange,
  onCourseCreated,
  placeholder = "Search or type course name...",
  className = ""
}) {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef(null);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:3300/api/courses");
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
    } catch (e) {
      console.error("Failed to load courses for combobox:", e);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Update query when value (courseId) changes
  useEffect(() => {
    if (value) {
      const found = courses.find((c) => c._id === value || c.id === value);
      if (found) {
        setQuery(found.name);
      }
    }
  }, [value, courses]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCourses = query.trim() === ""
    ? courses
    : courses.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const exactMatch = courses.find(
    (c) => c.name.toLowerCase() === query.trim().toLowerCase()
  );

  const handleSelect = (course) => {
    setQuery(course.name);
    onChange(course._id || course.id, course);
    setIsOpen(false);
  };

  const handleCreateCustomCourse = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    try {
      setCreating(true);
      const res = await axios.post("http://localhost:3300/api/courses", {
        name: trimmed,
        duration: "4 Weeks",
        description: `Custom created course for ${trimmed}`
      });

      const newCourse = res.data;
      setCourses((prev) => [newCourse, ...prev]);
      setQuery(newCourse.name);
      onChange(newCourse._id || newCourse.id, newCourse);
      if (onCourseCreated) onCourseCreated(newCourse);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to create custom course:", err);
      alert("Failed to create custom course. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <BookOpen size={18} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition text-sm font-medium"
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <ChevronsUpDown size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-64 overflow-y-auto p-1.5 space-y-1 animate-fadeIn">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((c) => {
              const isSelected = value === c._id || value === c.id;
              return (
                <button
                  key={c._id || c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {isSelected && <Check size={16} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="px-3.5 py-2 text-xs text-slate-400">
              No matching courses found.
            </div>
          )}

          {/* Create custom course option if typed query doesn't match an existing course exactly */}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={handleCreateCustomCourse}
              disabled={creating}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-left text-sm bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/60 dark:to-emerald-950/60 text-teal-800 dark:text-teal-200 hover:from-teal-100 hover:to-emerald-100 dark:hover:from-teal-900/80 border border-teal-200/60 dark:border-teal-800/60 font-semibold transition"
            >
              <Plus size={16} className="text-teal-600 dark:text-teal-400" />
              <span>
                {creating ? "Creating Course..." : `Add Custom Course: "${query.trim()}"`}
              </span>
              <Sparkles size={14} className="ml-auto text-amber-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
