import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TeacherLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
// Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3300/api/auth/Teacher-login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role || "teacher");
      const userPayload = res.data.user || {
        name: "Teacher",
        email: formData.email,
        role: "teacher",
        profilePic: "https://cdn-icons-png.flaticon.com/512/3429/3429402.png"
      };
      localStorage.setItem("user", JSON.stringify(userPayload));
      localStorage.setItem("teacher_user", JSON.stringify(userPayload));
      localStorage.setItem("userid", userPayload._id || userPayload.id || "");
      window.dispatchEvent(new Event("tokenChanged"));
      window.dispatchEvent(new Event("userUpdated"));
      navigate("/teacher-dashboardpage"); 
    } catch (error) {
      console.error(error);
      alert(" Invalid credentials!");
    }
  };

// Render the login form

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-violet-600 via-pink-500 to-red-400 justify-center items-center">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-center mb-4 text-white">TEACHER LOGIN</h1>
        <p className="text-center text-gray-300 mb-8">
          Please enter your login and password!
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 mb-6 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <button
            type="submit"
            className="w-full py-3 bg-transparent border-2 border-green-500 rounded-xl hover:bg-green-600 hover:text-black transition-all text-white font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherLogin;