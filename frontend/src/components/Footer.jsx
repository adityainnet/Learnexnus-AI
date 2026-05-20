import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      // FIX: Responsive margins aur padding mobile screens ke liye
      className="z-10 mx-4 sm:mx-6 mb-6 mt-16 md:mt-24 rounded-2xl bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-2xl border border-white/10 px-6 py-8 md:px-8 md:py-10 shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
    >
      {/* Top Section: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start">

        {/* Column 1: Brand & Info */}
        <motion.div
          whileHover={{ rotateX: 6, rotateY: -6 }}
          // FIX: Left align text on all screen sizes for cleaner look
          className="flex flex-col gap-4 transform-gpu items-start text-left"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="flex items-center gap-3 cursor-pointer"
            style={{ transform: "translateZ(20px)" }}
            onClick={() => navigate("/")}
          >
            <img
              src="/logo.png"
              alt="ExamNotes AI"
              className="h-8 w-8 md:h-9 md:w-9 object-contain"
            />
            <span
              className="text-xl font-semibold bg-gradient-to-br from-white via-gray-300 to-white bg-clip-text text-transparent"
              style={{ textShadow: "0 6px 18px rgba(0,0,0,0.4)" }}
            >
              Learnexnus <span className="text-gray-400">AI</span>
            </span>
          </div>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Learnexnus AI helps students generate exam-focused notes, revision
            materials, diagrams, and printable PDFs in seconds.
          </p>
        </motion.div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col items-start">
          <h1 className="text-sm font-bold text-white mb-2 md:mb-4 tracking-wider uppercase">
            Quick Links
          </h1>
          <ul className="space-y-1 md:space-y-3 text-sm w-full">
            {/* FIX: Added py-2 for bigger touch targets on mobile */}
            <li
              onClick={() => navigate("/notes")}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 py-2 md:py-0"
            >
              <span className="text-gray-600 inline">›</span> Notes
            </li>
            <li
              onClick={() => navigate("/history")}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 py-2 md:py-0"
            >
              <span className="text-gray-600 inline">›</span> History
            </li>
            <li
              onClick={() => navigate("/pricing")}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 py-2 md:py-0"
            >
              <span className="text-gray-600 inline">›</span> Add Credits
            </li>
          </ul>
        </div>

        {/* Column 3: Support & Account */}
        <div className="flex flex-col items-start">
          <h1 className="text-sm font-bold text-white mb-2 md:mb-4 tracking-wider uppercase">
            Support & Account
          </h1>
          <ul className="space-y-1 md:space-y-3 text-sm w-full">
            <li
              onClick={() => navigate("/auth")}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2 py-2 md:py-0"
            >
              <span className="text-gray-600 inline">›</span> Sign In
            </li>
            <li
              onClick={handleSignOut}
              className="text-red-400/80 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-2 py-2 md:py-0"
            >
              <span className="text-gray-600 inline">›</span> Sign Out
            </li>
            <li className="text-gray-400 transition-colors mt-3 pt-3 border-t border-white/10 w-full">
              adityakumar.innet@gmail.com
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section: Divider & Copyright */}
      <div className="mt-8 md:mt-10 pt-6 border-t border-white/10 flex flex-col-reverse md:flex-row items-center justify-between gap-5 text-center md:text-left">
        <p className="text-xs sm:text-sm text-gray-500">
          © {new Date().getFullYear()} Learnexnus AI. All rights reserved.
        </p>

        {/* Animated Signature with New Gray Gradient */}
        <div className="flex items-center justify-center gap-1.5 text-sm text-gray-400 font-medium">
          Crafted with
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-red-500 inline-block mx-1"
          >
            ❤️
          </motion.span>
          by
          <motion.span
            whileHover={{ scale: 1.05, y: -2 }}
            animate={{ backgroundPosition: ["0%", "200%"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
            // Applied sleek gray gradient here
            className="bg-gradient-to-r from-slate-300 via-gray-400 to-zinc-500 bg-clip-text text-transparent font-bold cursor-pointer ml-1 text-base"
          >
            Aditya
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default Footer;