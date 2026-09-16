import React, { useState,useEffect}from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; 

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn,setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  useEffect(()=>{
  const checkToken =()=>{
    setIsLoggedIn(!!localStorage.getItem("token"));
  };
  checkToken();
  window.addEventListener("storge",checkToken);
  return()=>{window.removeEventListener("storage",checkToken);};
},[]);

  const handleLogout= () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("tokenChanged"));
    setIsLoggedIn(false);
    navigate("/admin-login");
  }

  return (
    <nav className="bg-gray-950 w-full shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center text-white">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white hover:text-teal-400">
          Online Exam Panel
        </Link>

        {/* Menu Button (Mobile) */}
        <button
          className="sm:hidden text-white text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden sm:flex space-x-6">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/teacher-login">Teacher</NavLink>
          <NavLink to="/student-login">Student</NavLink>
          <NavLink to="/admin-login">Admin</NavLink>
        </div>

        {/* Right Side Links */}
        <div className="hidden sm:flex space-x-4">
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="sm:hidden bg-gray-900 text-white px-6 py-4 space-y-3">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/teacher-login">Teacher</NavLink>
          <NavLink to="/student-login">Student</NavLink>
          <NavLink to="/admin-login">Admin</NavLink>
          <div className="border-t border-gray-700 pt-3">
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/contact">Contact Us</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="block text-gray-300 hover:text-white transition duration-200"
  >
    {children}
  </Link>
);

export default Navbar;