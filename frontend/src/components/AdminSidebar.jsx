import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Book,
  HelpCircle,
  GraduationCap,
  LayoutDashboard,
  Activity,
  ListOrdered,
  Camera,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import ProfilePhotoModal from "./ProfilePhotoModal";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Administrator",
    role: "admin",
    profilePic: "https://cdn-icons-png.flaticon.com/512/219/219970.png",
  });

  const loadUser = () => {
    try {
      const adminStored = localStorage.getItem("admin_user");
      if (adminStored) {
        const parsed = JSON.parse(adminStored);
        if (parsed.name || parsed.email) {
          setUser({
            name: parsed.name || parsed.username || "Administrator",
            role: "admin",
            profilePic:
              parsed.profilePic ||
              "https://cdn-icons-png.flaticon.com/512/219/219970.png",
          });
          return;
        }
      }
      const genericUser = localStorage.getItem("user");
      if (genericUser) {
        const parsed = JSON.parse(genericUser);
        if (parsed.role === "admin") {
          setUser({
            name: parsed.name || parsed.username || "Administrator",
            role: "admin",
            profilePic:
              parsed.profilePic ||
              "https://cdn-icons-png.flaticon.com/512/219/219970.png",
          });
          return;
        }
      }
      setUser({
        name: "Administrator",
        role: "admin",
        profilePic: "https://cdn-icons-png.flaticon.com/512/219/219970.png",
      });
    } catch (e) {}
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("userUpdated", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("userUpdated", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("admin_user");
    window.dispatchEvent(new Event("tokenChanged"));
    navigate("/admin-login");
  };

  const menuItems = [
    { to: "/admin-dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin-activities", label: "Activity Logs", icon: <Activity size={20} /> },
    { to: "/questions", label: "Add Question", icon: <HelpCircle size={20} /> },
    { to: "/questions-list", label: "Questions Bank", icon: <ListOrdered size={20} /> },
    { to: "/courses", label: "Courses", icon: <Book size={20} /> },
    { to: "/teacher-dashboard", label: "Teachers", icon: <User size={20} /> },
    { to: "/admin-students", label: "Students", icon: <GraduationCap size={20} /> },
  ];

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl transition-all duration-300 z-40 flex flex-col justify-between border-r border-white/10 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          {/* Brand Header with Toggle */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            {isOpen ? (
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="p-2 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-xl shadow-md shadow-teal-500/20 flex-shrink-0">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div className="truncate">
                  <h2 className="text-sm font-extrabold tracking-tight text-white leading-tight">
                    Online Exam Panel
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                    Admin Portal
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto p-2 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-xl shadow-md shadow-teal-500/20">
                <ShieldCheck size={20} className="text-white" />
              </div>
            )}

            {toggleSidebar && isOpen && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {/* Admin Profile Section */}
          <div className="flex flex-col items-center py-4 px-3 border-b border-white/10 bg-white/[0.02]">
            <div
              onClick={() => setIsPhotoModalOpen(true)}
              className="relative cursor-pointer group"
              title="Click to update profile photo"
            >
              <img
                src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/219/219970.png"}
                alt={user.name}
                className={`rounded-full border-2 border-teal-400 p-0.5 shadow-lg object-cover transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-400 ${
                  isOpen ? "w-14 h-14" : "w-10 h-10"
                }`}
                onError={(e) => {
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/219/219970.png";
                }}
              />
              <span className="absolute bottom-0 right-0 bg-teal-500 hover:bg-emerald-400 text-white p-1 rounded-full shadow-md border-2 border-slate-900 transition-colors">
                <Camera size={10} />
              </span>
            </div>

            {isOpen && (
              <div className="text-center mt-2.5 px-2 w-full">
                <h3 className="text-sm font-bold tracking-wide text-white truncate">
                  {user.name}
                </h3>
                <span className="inline-block mt-0.5 text-[10px] text-teal-300 font-semibold px-2 py-0.5 bg-teal-900/50 rounded-full border border-teal-500/30">
                  MongoDB Active
                </span>
              </div>
            )}
          </div>

          {/* Sidebar Navigation Links */}
          <nav className="flex flex-col space-y-1.5 p-3 overflow-y-auto max-h-[calc(100vh-280px)]">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold shadow-lg shadow-teal-500/25"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  title={!isOpen ? item.label : undefined}
                >
                  <div className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                    {item.icon}
                  </div>
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Settings & Logout */}
        <div className="p-3 border-t border-white/10 bg-slate-950/60 space-y-1.5">
          {/* Setting Action */}
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-teal-300 transition-all duration-200 ${
              !isOpen ? "justify-center" : ""
            }`}
            title="Setting"
          >
            <Settings size={20} className="text-teal-400 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Setting</span>}
          </button>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all duration-200 ${
              !isOpen ? "justify-center" : ""
            }`}
            title="Logout"
          >
            <LogOut size={20} className="text-rose-400 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Profile Photo Update Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhoto={user.profilePic}
        role="admin"
        targetUser={user}
        onPhotoUpdated={(newUrl) => {
          setUser((prev) => ({ ...prev, profilePic: newUrl }));
          try {
            const au = JSON.parse(localStorage.getItem("admin_user") || "{}");
            au.profilePic = newUrl;
            localStorage.setItem("admin_user", JSON.stringify(au));
          } catch (e) {}
        }}
      />
    </>
  );
};

export default AdminSidebar;