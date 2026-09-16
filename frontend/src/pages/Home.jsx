import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // ---------------- PARTICLES + MOUSE INTERACTION ----------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: null, y: null };

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
// ---------------- PARTICLE CLASS DEFINITION ----------------
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > width || this.x < 0) this.speedX *= -1;
        if (this.y > height || this.y < 0) this.speedY *= -1;

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.x -= dx / 15;
          this.y -= dy / 15;
        }
      }
      draw() {
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
// ---------------- PARTICLE INITIALIZATION & ANIMATION ----------------
    const particles = Array.from({ length: 200 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* CANVAS PARTICLES */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* ANIMATED GRADIENT BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-800 to-blue-500 animate-gradient z-[-1]" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-10 shadow-2xl transform transition-all duration-500 hover:scale-105">
          <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Online Exam Panel
          </h1>
          <p className="text-lg text-gray-200 max-w-xl mb-6">
            Take exams online, track your performance, and enhance your learning
            experience.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 bg-blue-600 text-white text-lg rounded-xl shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* WAVE BACKGROUND */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#ffffff"
          fillOpacity="0.15"
          d="M0,224L48,197.3C96,171,192,117,288,117.3C384,117,480,171,576,202.7C672,235,768,245,864,224C960,203,1056,149,1152,144C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z"
        />
      </svg>

      {/* GRADIENT ANIMATION STYLE */}
      <style>
        {`
          .animate-gradient {
            background-size: 400% 400%;
            animation: gradientBG 10s ease infinite;
          }
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
