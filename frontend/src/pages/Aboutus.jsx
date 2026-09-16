import React from "react";
import { ShieldCheck, Clock, BookOpen } from "lucide-react";

const Aboutus = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col">
      
      {/* MAIN SECTION */}
      <div className="flex-grow max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-10 grid md:grid-cols-2 gap-12 items-center transition-all duration-300 hover:shadow-2xl">

          {/* IMAGE */}
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0"
              alt="Online Exam Panel"
              className="rounded-2xl shadow-lg w-full max-w-md transform hover:scale-105 transition duration-300"
            />
          </div>

          {/* CONTENT */}
          <div>
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
              About <span className="text-indigo-600">Online Exam Panel</span>
            </h2>

            <p className="text-gray-600 leading-relaxed mb-8">
              Online Exam Panel is a smart and secure examination platform designed
              for institutions, teachers, and students. It simplifies exam
              creation, evaluation, and result analysis while ensuring accuracy,
              transparency, and performance.
            </p>

            {/* FEATURES */}
            <div className="grid gap-5">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition">
                <ShieldCheck className="text-indigo-600 w-8 h-8" />
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Secure Authentication
                  </h4>
                  <p className="text-sm text-gray-600">
                    JWT-based login system with role-based access.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition">
                <BookOpen className="text-blue-600 w-8 h-8" />
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Easy Exam Management
                  </h4>
                  <p className="text-sm text-gray-600">
                    Create, edit, and manage exams effortlessly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition">
                <Clock className="text-green-600 w-8 h-8" />
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Time-Based Evaluation
                  </h4>
                  <p className="text-sm text-gray-600">
                    Auto scoring with timers and instant results.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>
            © {new Date().getFullYear()} Online Exam Panel. All Rights Reserved.
          </p>
          <div className="mt-2 space-x-6">
            <a href="/about" className="hover:text-white transition">
              About
            </a>
            <a href="/contact" className="hover:text-white transition">
              Contact
            </a>
            <a href="/privacy" className="hover:text-white transition">
              Privacy
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Aboutus;
