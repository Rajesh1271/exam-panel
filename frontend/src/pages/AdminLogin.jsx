import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3300/api/auth/Admin-login",
        formData
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role || "admin");
      const userPayload = res.data.user || {
        name: "Admin",
        email: formData.email,
        role: "admin",
        profilePic: "https://cdn-icons-png.flaticon.com/512/219/219970.png"
      };
      localStorage.setItem("user", JSON.stringify(userPayload));
      localStorage.setItem("admin_user", JSON.stringify(userPayload));
      localStorage.setItem("userid", userPayload._id || userPayload.id || "");
      window.dispatchEvent(new Event("tokenChanged"));
      window.dispatchEvent(new Event("userUpdated"));
      navigate("/admin-dashboard");
    } catch (error) {
      console.error(error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen justify-center items-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient bg-cover z-0"></div>

      <div className="relative bg-gray-900 p-10 rounded-2xl shadow-2xl w-96 z-10">
        <h1 className="text-3xl font-bold text-center mb-4 text-white">
          ADMIN LOGIN
        </h1>
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
            className="w-full p-3 mb-4 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all hover:scale-105 hover:ring-4 hover:ring-pink-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 mb-6 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all hover:scale-105 hover:ring-4 hover:ring-pink-400"
          />

          <button
            type="submit"
            className="w-full py-3 bg-transparent border-2 border-green-500 rounded-xl text-white font-semibold hover:bg-green-600 hover:text-black hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-xl"
          >
            Login
          </button>
        </form>
      </div>

      {/* Styles for Animations */}
      <style>{`
        /* Auto Gradient Animation */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradientShift 5s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
