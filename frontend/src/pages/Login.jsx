import React, { useState } from "react";
import axios from "axios";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Attempting login with:", formData);
    try {
      const res = await axios.post("http://localhost:3300/api/auth/login", formData);
      console.log("Server response:", res.data);
      alert("Login Successful!");
    } catch (error) {
      console.error("Login error:", error.message);
      alert("Login Failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-600 p-4">
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-blue-400/30 transition-all duration-500 hover:scale-[1.02]">
        <h1 className="text-center text-3xl font-extrabold text-white tracking-wide mb-2">
          ONLINE EXAM PANEL
        </h1>
        <h2 className="text-center text-gray-300 mb-6">
          Please enter your login and password
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-gray-300">
              <input
                type="checkbox"
                className="mr-2 accent-blue-500"
              />
              Remember Me
            </label>
            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition duration-300 shadow-md hover:shadow-blue-400/50"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};