import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3300/api/auth/Student-login",
        formData
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      localStorage.setItem("role", res.data.role || "student");

      const userPayload = res.data.user || {
        name: "Student",
        email: formData.email,
        role: "student",
        profilePic: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
      };
      localStorage.setItem("user", JSON.stringify(userPayload));
      localStorage.setItem("student_user", JSON.stringify(userPayload));

      const idFromRes =
        userPayload._id ||
        res.data.userId ||
        res.data.studentId ||
        res.data.id;

      if (idFromRes) {
        localStorage.setItem("userid", idFromRes);
      }

      window.dispatchEvent(new Event("tokenChanged"));
      window.dispatchEvent(new Event("userUpdated"));

      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/student-dashboardpage");
      }, 800);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="flex min-h-screen justify-center items-center"
      style={{
        background: "linear-gradient(270deg, #00ffff, #ff00ff, #00ff6a, #00b7ff)",
        backgroundSize: "600% 600%",
        animation: "neonMove 12s ease infinite",
      }}
    >
      {/* Inline keyframes */}
      <style>
        {`
          @keyframes neonMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      {/* Login Card */}
      <div
        className="
          bg-gray-900 p-10 rounded-2xl shadow-2xl w-96
          transform transition-all duration-500
          hover:scale-105 hover:shadow-cyan-500/50
          animate-fadeIn
        "
      >
        <h1 className="text-3xl font-bold text-center mb-4 text-white">
          STUDENT LOGIN
        </h1>

        {successMessage && (
          <p className="text-green-400 text-center mb-4 font-semibold animate-pulse">
            {successMessage}
          </p>
        )}

        <p className="text-center text-gray-300 mb-8">
          Please enter your email and password
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="
              w-full p-3 mb-4 rounded-xl
              bg-gray-800 text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-cyan-400
              transition-all duration-300
              hover:bg-gray-700
            "
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="
              w-full p-3 mb-6 rounded-xl
              bg-gray-800 text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-purple-400
              transition-all duration-300
              hover:bg-gray-700
            "
          />

          <button
            type="submit"
            className="
              w-full py-3 rounded-xl font-semibold
              bg-gradient-to-r from-cyan-500 to-blue-500
              text-white transition-all duration-300
              hover:scale-105 hover:from-purple-500 hover:to-pink-500
              active:scale-95
            "
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
