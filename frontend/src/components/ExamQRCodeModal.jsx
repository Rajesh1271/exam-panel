import React, { useState } from "react";
import {
  QrCode,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  Share2,
  Sparkles,
  ExternalLink,
  BookOpen
} from "lucide-react";

export default function ExamQRCodeModal({ isOpen, onClose, exam }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !exam) return null;

  const examCode = exam.examcode || exam.examCode || `EXAM-${(exam._id || "").slice(-6).toUpperCase()}`;
  const examTitle = exam.title || exam.examname || "Online Examination";
  const duration = exam.durationMinutes || exam.duration || 30;
  const directLink = `${window.location.origin}/student-exam/${exam._id || exam.id}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `${window.location.origin}/join-exam?code=${examCode}`
  )}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(examCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div
        className={`relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-teal-500/30 shadow-2xl shadow-teal-500/10 overflow-hidden ${
          isFullscreen ? "max-w-none h-full rounded-none flex flex-col justify-center items-center p-8" : ""
        }`}
      >
        {/* Header */}
        <div className="w-full px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-md shadow-blue-500/20 text-white">
              <QrCode size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">QR-Based Exam Joining</h3>
              <p className="text-xs text-slate-400">Students scan with mobile or enter code</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
              title={isFullscreen ? "Exit Projector Mode" : "Classroom Projector Mode"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* QR & Code Card */}
        <div className="p-6 flex flex-col items-center space-y-6 text-center max-w-md w-full">
          {/* Exam Title & Badge */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
              JOIN EXAM SESSION
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2 truncate max-w-sm">
              {examTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Duration: {duration} Minutes</p>
          </div>

          {/* QR Code Container */}
          <div className="relative p-4 bg-white rounded-3xl shadow-2xl ring-4 ring-cyan-500/30 ring-offset-4 ring-offset-slate-900">
            <img
              src={qrImageUrl}
              alt="Exam QR Code"
              className="w-56 h-56 object-contain rounded-2xl"
              onError={(e) => {
                // Fallback SVG placeholder
                e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=EXAM-JOIN";
              }}
            />
          </div>

          {/* Access Code Banner */}
          <div className="w-full bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Exam Access Code
              </span>
              <div className="text-2xl font-black text-cyan-300 tracking-widest font-mono">
                {examCode}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/40 flex items-center gap-1.5 transition"
            >
              {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedCode ? "Copied" : "Copy Code"}</span>
            </button>
          </div>

          {/* Share Direct Link */}
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/5 flex items-center justify-center gap-2 transition"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            <span>{copiedLink ? "Direct Link Copied!" : "Copy Direct Exam Link"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
