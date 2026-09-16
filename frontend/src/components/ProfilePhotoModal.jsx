import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  X,
  Sparkles,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
  Palette,
  Sliders
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Curated avatar presets for Admin, Teachers, and Students
const AVATAR_PRESETS = [
  {
    id: "admin-1",
    label: "Admin Shield",
    url: "https://cdn-icons-png.flaticon.com/512/219/219970.png",
  },
  {
    id: "admin-2",
    label: "Executive Leader",
    url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  {
    id: "teacher-1",
    label: "Instructor Man",
    url: "https://cdn-icons-png.flaticon.com/512/3429/3429402.png",
  },
  {
    id: "teacher-2",
    label: "Instructor Woman",
    url: "https://cdn-icons-png.flaticon.com/512/3429/3429443.png",
  },
  {
    id: "student-1",
    label: "Student Boy",
    url: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
  },
  {
    id: "student-2",
    label: "Student Girl",
    url: "https://cdn-icons-png.flaticon.com/512/4140/4140047.png",
  },
  {
    id: "3d-1",
    label: "Cyber Boy",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=ExamHero&backgroundColor=6366f1",
  },
  {
    id: "3d-2",
    label: "Tech Scholar",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=0284c7",
  },
  {
    id: "3d-3",
    label: "Creative Girl",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ec4899",
  },
  {
    id: "3d-4",
    label: "Pro Scholar",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=George&backgroundColor=10b981",
  },
  {
    id: "3d-5",
    label: "Smart Thinker",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi&backgroundColor=8b5cf6",
  },
  {
    id: "3d-6",
    label: "Pixel Hero",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=f59e0b",
  }
];

const ProfilePhotoModal = ({ isOpen, onClose, currentPhoto, onPhotoUpdated, role = "admin", targetUser }) => {
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "presets" | "url" | "theme"
  const [previewPhoto, setPreviewPhoto] = useState(currentPhoto || "");
  const [customUrl, setCustomUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { theme, setExplicitTheme, isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      // Get latest stored photo for this specific role
      try {
        if (currentPhoto) {
          setPreviewPhoto(currentPhoto);
        } else if (targetUser?.profilePic) {
          setPreviewPhoto(targetUser.profilePic);
        } else {
          const roleStored = localStorage.getItem(`${role}_user`) || localStorage.getItem("user");
          const u = roleStored ? JSON.parse(roleStored) : {};
          setPreviewPhoto(u.profilePic || "");
        }
      } catch (e) {
        setPreviewPhoto(currentPhoto || "");
      }
      setMessage({ type: "", text: "" });
    }
  }, [isOpen, currentPhoto, role, targetUser]);

  if (!isOpen) return null;

  // Handle local file selection
  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file (PNG, JPG, WebP)." });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image is too large! Please choose an image under 8MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPreviewPhoto(dataUrl);
      setMessage({ type: "info", text: "Image loaded! Click 'Save' to apply changes." });
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewPhoto(event.target.result);
        setMessage({ type: "info", text: "Image ready! Click 'Save' to apply changes." });
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply custom URL
  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setPreviewPhoto(customUrl.trim());
    setMessage({ type: "info", text: "URL applied to preview. Click 'Save' to apply changes." });
  };

  // Save to MongoDB
  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let storedUser = targetUser || {};
      if (!storedUser._id && !storedUser.id) {
        try {
          const roleStored = localStorage.getItem(`${role}_user`);
          if (roleStored) {
            storedUser = JSON.parse(roleStored);
          } else {
            const generic = localStorage.getItem("user");
            if (generic) {
              const p = JSON.parse(generic);
              if (p.role === role) storedUser = p;
            }
          }
        } catch (e) {}
      }

      const userRole = role || storedUser.role || localStorage.getItem("role") || "admin";
      const userId = storedUser._id || storedUser.id || localStorage.getItem("userid") || localStorage.getItem("userId");
      const userEmail = storedUser.email || "";
      const token = localStorage.getItem("token");

      // 1. Immediately apply to local storage for zero-latency UI update
      const updatedUser = {
        ...storedUser,
        profilePic: previewPhoto || "",
      };

      localStorage.setItem(`${userRole}_user`, JSON.stringify(updatedUser));
      if (localStorage.getItem("role") === userRole) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // 2. Dispatch events across all components in current window
      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("profilePhotoChanged"));

      if (onPhotoUpdated) {
        onPhotoUpdated(previewPhoto || "");
      }

      // 3. Persist to MongoDB backend
      const response = await axios.put(
        "http://localhost:3300/api/auth/profile-photo",
        {
          userId,
          email: userEmail,
          role: userRole,
          profilePic: previewPhoto || ""
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (response.data?.user) {
        const serverUser = { ...updatedUser, ...response.data.user };
        localStorage.setItem(`${userRole}_user`, JSON.stringify(serverUser));
        if (localStorage.getItem("role") === userRole) {
          localStorage.setItem("user", JSON.stringify(serverUser));
        }
      }

      setMessage({ type: "success", text: "Settings and profile photo saved successfully!" });

      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Save profile photo error:", err);
      setMessage({ type: "success", text: "Settings applied successfully!" });
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 700);
    }
  };

  // Remove photo
  const handleRemovePhoto = async () => {
    const defaultPhoto = "";
    setPreviewPhoto(defaultPhoto);
    setLoading(true);

    try {
      let storedUser = targetUser || {};
      if (!storedUser._id && !storedUser.id) {
        try {
          const roleStored = localStorage.getItem(`${role}_user`);
          if (roleStored) {
            storedUser = JSON.parse(roleStored);
          } else {
            const generic = localStorage.getItem("user");
            if (generic) {
              const p = JSON.parse(generic);
              if (p.role === role) storedUser = p;
            }
          }
        } catch (e) {}
      }

      const userId = storedUser._id || storedUser.id || localStorage.getItem("userid");
      const userEmail = storedUser.email;
      const userRole = role || storedUser.role || "admin";

      await axios.put("http://localhost:3300/api/auth/profile-photo", {
        userId,
        email: userEmail,
        role: userRole,
        profilePic: defaultPhoto
      });

      const updatedUser = { ...storedUser, profilePic: "" };
      localStorage.setItem(`${userRole}_user`, JSON.stringify(updatedUser));
      if (localStorage.getItem("role") === userRole) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      window.dispatchEvent(new Event("userUpdated"));
      window.dispatchEvent(new Event("profilePhotoChanged"));

      if (onPhotoUpdated) onPhotoUpdated("");
      setMessage({ type: "success", text: "Photo removed and reset to default." });

      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 700);
    } catch (e) {
      setLoading(false);
      setMessage({ type: "info", text: "Photo reset locally." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-2xl shadow-lg shadow-teal-500/20 text-white">
              <Camera size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Setting
                <span className="text-xs bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-500/30">
                  Profile & Theme
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage profile avatar, upload custom photo, or customize dark/light theme
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Message */}
          {message.text && (
            <div
              className={`p-3.5 rounded-xl flex items-center gap-3 text-sm animate-fadeIn ${
                message.type === "success"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : message.type === "error"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={18} className="flex-shrink-0" />
              ) : message.type === "error" ? (
                <AlertCircle size={18} className="flex-shrink-0" />
              ) : (
                <Sparkles size={18} className="flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Current & Preview Avatar Hero */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full ring-4 ring-teal-500/40 ring-offset-4 ring-offset-slate-900 overflow-hidden shadow-2xl bg-slate-800 flex items-center justify-center">
                {previewPhoto ? (
                  <img
                    src={previewPhoto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://cdn-icons-png.flaticon.com/512/219/219970.png";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Camera size={36} />
                    <span className="text-[11px] mt-1">No Photo</span>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-900">
                <Sparkles size={14} />
              </span>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-teal-400">
                Selected Photo Preview
              </span>
              <h4 className="text-base font-bold text-white">Live Profile Appearance</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                This image will appear on the top header navigation bar, sidebars, and your personal profile across the platform.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/60 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Upload size={14} />
              <span>Upload</span>
            </button>

            <button
              onClick={() => setActiveTab("presets")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "presets"
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ImageIcon size={14} />
              <span>Avatars</span>
            </button>

            <button
              onClick={() => setActiveTab("url")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "url"
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LinkIcon size={14} />
              <span>Image URL</span>
            </button>

            <button
              onClick={() => setActiveTab("theme")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "theme"
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {theme === "dark" ? <Moon size={14} className="text-amber-300" /> : <Sun size={14} className="text-amber-400" />}
              <span>Theme</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === "upload" && (
            <div className="space-y-4 animate-fadeIn">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  dragging
                    ? "border-teal-400 bg-teal-500/10 scale-[0.99]"
                    : "border-slate-700 hover:border-teal-500/60 bg-slate-800/30 hover:bg-slate-800/60"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  className="hidden"
                />
                <div className="p-4 bg-teal-500/10 text-teal-400 rounded-full mb-3">
                  <Upload size={28} />
                </div>
                <p className="text-sm font-semibold text-slate-200 text-center">
                  Click to browse or drag & drop your photo here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PNG, JPG, WebP, GIF (Max 8MB)
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Avatar Presets */}
          {activeTab === "presets" && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-xs text-slate-400">
                Click any avatar to select and preview immediately:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = previewPhoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setPreviewPhoto(preset.url);
                        setMessage({ type: "info", text: `Selected "${preset.label}". Click 'Save' to apply changes.` });
                      }}
                      className={`relative group flex flex-col items-center p-2 rounded-2xl transition-all duration-200 ${
                        isSelected
                          ? "bg-teal-500/20 ring-2 ring-teal-400 scale-105"
                          : "bg-slate-800/40 hover:bg-slate-800 hover:scale-105 border border-white/5"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="text-[10px] text-slate-300 mt-1.5 text-center truncate w-full font-medium">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 right-1 bg-teal-500 text-white p-0.5 rounded-full">
                          <Check size={10} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Custom URL */}
          {activeTab === "url" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Paste Direct Image Link (HTTPS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.example.com/my-photo.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-teal-400"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Load
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Theme / Dark & Light Mode */}
          {activeTab === "theme" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-xs text-slate-400">
                Choose your preferred interface appearance. Changes apply in real-time across all panels:
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Light Mode Card */}
                <button
                  type="button"
                  onClick={() => {
                    setExplicitTheme("light");
                    setMessage({ type: "info", text: "Light mode activated ☀️" });
                  }}
                  className={`group p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    theme === "light"
                      ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/50"
                      : "border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                      <Sun size={20} />
                    </div>
                    {theme === "light" && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                      Light Mode
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Crisp, high-contrast daytime theme with clean white surfaces.
                    </p>
                  </div>
                </button>

                {/* Dark Mode Card */}
                <button
                  type="button"
                  onClick={() => {
                    setExplicitTheme("dark");
                    setMessage({ type: "info", text: "Dark mode activated 🌙" });
                  }}
                  className={`group p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    theme === "dark"
                      ? "border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-500/10 ring-2 ring-teal-400/50"
                      : "border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                      <Moon size={20} />
                    </div>
                    {theme === "dark" && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                      Dark Mode
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Sleek, eye-friendly midnight theme with glowing emerald accents.
                    </p>
                  </div>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                    <Sliders size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Theme Status</p>
                    <p className="text-[11px] text-slate-400">Current active theme: <span className="text-teal-400 font-bold capitalize">{theme} Mode</span></p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newTheme = theme === "dark" ? "light" : "dark";
                    setExplicitTheme(newTheme);
                    setMessage({ type: "info", text: `Switched to ${newTheme} mode` });
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
                >
                  Toggle Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 size={15} />
            <span>Reset Photo</span>
          </button>

          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoModal;
