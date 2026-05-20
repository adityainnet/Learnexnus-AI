import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import QuestionForm from "../components/QuestionForm";
import SmartQuestionForm from "../components/SmartQuestionForm";
import QuestionResult from "../components/QuestionResult";

const Questions = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const credits = userData?.credits || 0;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeMode, setActiveMode] = useState("standard"); // "standard" | "smart"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-6 py-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-6 shadow-[0_20px_45px_rgba(0,0,0,0.6)] items-start flex md:items-center justify-between gap-4 flex-col md:flex-row"
      >
        {/* Left content */}
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
            ExamNotes AI
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            AI-Powered Question Generator
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm"
            onClick={() => navigate("/pricing")}
          >
            <span className="text-xl">🔷</span>
            <span>{credits}</span>
            <motion.span
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.97 }}
              className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-white text-xs font-bold"
            >
              ➕
            </motion.span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-3 rounded-full text-sm font-medium bg-white/10 border border-white/20 text-white hover:bg-white/20 transition flex items-center gap-2"
          >
            🏠 Home
          </button>
        </div>
      </motion.header>

      {/* Error message */}
      {error && (
        <div className="mb-6 max-w-7xl mx-auto text-center text-red-600 font-semibold bg-red-100/80 border border-red-200 py-3 px-4 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Switcher & Form */}
        <div className="lg:sticky lg:top-6 space-y-6">
          {/* Mode Switcher */}
          <div className="flex bg-black/85 border border-white/10 rounded-2xl p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setActiveMode("standard");
                setResult(null);
                setError("");
              }}
              className={`flex-1 py-3 text-xs font-semibold rounded-xl transition-all ${
                activeMode === "standard"
                  ? "bg-white text-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ✍️ Standard Generator
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode("smart");
                setResult(null);
                setError("");
              }}
              className={`flex-1 py-3 text-xs font-semibold rounded-xl transition-all ${
                activeMode === "smart"
                  ? "bg-white text-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🔍 Smart Document Analyzer
            </button>
          </div>

          {activeMode === "standard" ? (
            <QuestionForm
              loading={loading}
              setResult={setResult}
              setLoading={setLoading}
              setError={setError}
            />
          ) : (
            <SmartQuestionForm
              loading={loading}
              setResult={setResult}
              setLoading={setLoading}
              setError={setError}
            />
          )}
        </div>

        {/* Right Column: Result / Placeholder */}
        <div className="min-h-[500px]">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 bg-white/60 backdrop-blur-lg border border-dashed border-gray-300 rounded-2xl min-h-[500px]">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="text-7xl mb-5"
              >
                📋
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Your Practice Questions Appear Here
              </h3>
              <p className="text-sm text-center max-w-xs text-gray-500 leading-relaxed">
                {activeMode === "standard"
                  ? "Fill in the topic form on the left and click 'Generate Questions' to create your custom revision sheet."
                  : "Upload notes, images, or PDFs to parse raw content, analyze topics, and generate smart contextual questions."}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionResult result={result} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
