import React from "react";
import Navbar from "../components/Navbar.jsx";
import { motion, scale, transform } from "motion/react";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen overflow-hidden bg-white text-black">
      <Navbar />
      {/* Top */}
      <section className="max-w-7xl mx-auto px-8 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            whileHover={{ rotateX: 6, rotateY: -6 }}
            className="transform-gpu"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.h1
              // FIX: Changed 'br-gradient-to-br' to 'bg-gradient-to-br'
              className="text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-br from-black/90 via-black/60 to-black/90 bg-clip-text text-transparent"
              whileHover={{ y: -4 }}
              style={{
                transform: "translateZ(40px)",
                textShadow: "0 18px 40px rgba(0,0,0,0.25)",
              }}
            >
              Create Smart AI <br />
              Notes,Questions and Roadmaps in Seconds
            </motion.h1>
            <motion.p
              whileHover={{ y: -2 }}
              className="mt-6 max-w-xl text-lg bg-gradient-to-br from-gray-700 via-gray-500/80 to-gray-700 bg-clip-text text-transparent"
              style={{
                transform: "translateZ(40px)",
                textShadow: "0 18px 40px rgba(0,0,0,0.25)",
              }}
            >
              Transform the way you learn with AI-powered notes, smart question generation, visual roadmaps, and personalized academic assistance — all in one platform.
            </motion.p>
            <motion.button
              onClick={() => navigate("/notes")}

              whileHover={{
                y: -10,
                rotateX: 8,
                rotateY: -8,
                scale: 1.07,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="cursor-pointer mt-10 px-10 py-3 rounded-xl flex items-center gap-3 
                         bg-gradient-to-b border border-white/10
                         from-black/90 via-black/80 to-black/90
                         text-white font-semibold text-lg
                         shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
        {/* Right div of upper side */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          whileHover={{ Y: -12, rotateX: 8, rotateY: -8, scale: 1.05 }}
          className="transform-gpu"
          style={{ transformStyle: "preserve-3d" }}>
          <div className="overflow-hidden">
            <img src="/img1.png" alt="img"
              style={{ transform: "translateZ(35px)" }} />
          </div>
        </motion.div>
      </section>
      {/* Bottom */}
      <section className="max-w-7xl mx-auto px-8 py-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
        <Feature
          icon="📝"
          title="Exam Notes"
          des="High-yield exam-oriented notes with revision points."
          onClick={() => navigate("/notes")}
        />
        <Feature
          icon="📁"
          title="Project Notes"
          des="Well-structured content for assignments and projects."
          onClick={() => navigate("/notes")}
        />
        <Feature
          icon="📊"
          title="Diagrams"
          des="Auto-generated visual diagrams for clarity."
          onClick={() => navigate("/notes")}
        />
        <Feature
          icon="🧠"
          title="Questions"
          des="AI-Powered Practice Question & Answer Generator."
          onClick={() => navigate("/questions")}
        />
        <Feature
          icon="🗺️"
          title="Roadmaps"
          des="AI-powered interactive career roadmaps & paths."
          onClick={() => navigate("/roadmap")}
        />
        <Feature
          icon="⬇️"
          title="PDF Download"
          des="Download clean, printable PDFs instantly."
          onClick={() => navigate("/notes")}
        />
      </section>
      <Footer />
    </div >
  );
};
function Feature({ icon, title, des, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -12, rotateX: 8, rotateY: -8, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="relative rounded-2xl p-6
      bg-gradient-to-br from-black/90 via-black/80 to-black/90
      backdrop-blur-2xl
      border border-white/10
      shadow-[0_30px_80px_rgba(0,0,0,0.7)]
      text-white cursor-pointer"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{des}</p>
      </div>
    </motion.div>
  );
}

export default Home;
