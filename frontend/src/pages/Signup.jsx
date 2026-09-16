import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  //  role:"teacher",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password check
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3300/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      console.log(res.data);
      alert("Signup successful!");
      
      if (formData.role === "student") {
        navigate("/Student-login");
      } else if (formData.role === "teacher") {
        navigate("/Teacher-login");
      } else {
        navigate("/Admin-login");
      }

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Signup failed!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-lg w-full max-w-md text-white"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white focus:outline-none placeholder-gray-300"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white focus:outline-none placeholder-gray-300"
        />

        <input
          type="password"
          name="password"
          placeholder="Set Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white focus:outline-none placeholder-gray-300"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white focus:outline-none placeholder-gray-300"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-3 mb-6 rounded-xl bg-white/20 text-white focus:outline-none"
        >
          <option value="student" className="text-black">Student</option>
          <option value="teacher" className="text-black">Teacher</option>
          {/*<option value="admin" className="text-black">Admin</option>*/}
        </select>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-lg transition-all duration-300"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Signup;