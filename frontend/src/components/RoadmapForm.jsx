import React, { useState } from "react";
import { motion } from "framer-motion";
import { generateRoadmap } from "../services/api";
import { useDispatch } from "react-redux";
import { updateCredits } from "../redux/userSlice.js";

const RoadmapForm = ({ loading, setResult, setLoading, setError }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("skill"); // 'skill' or 'career'
  const [level, setLevel] = useState("Beginner"); // 'Beginner', 'Intermediate', 'Advanced'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please specify a topic or career path.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await generateRoadmap({ type, query, level });
      if (response && response.roadmapData) {
        setResult(response);
        // If credits left is returned, update user credits in store
        if (response.creditsLeft !== undefined) {
          dispatch(updateCredits(response.creditsLeft));
        }
      } else {
        setError("Invalid response format. Please try again.");
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to generate roadmap. Please check your credit balance or try again later.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text, typeVal) => {
    setQuery(text);
    setType(typeVal);
  };

  const suggestions = [
    { text: "Career options after 12th PCB/PCM", type: "career", icon: "🎓" },
    { text: "Frontend Developer Path", type: "skill", icon: "💻" },
    { text: "AI/ML Engineer Path", type: "skill", icon: "🤖" },
    { text: "UI/UX Designer Path", type: "skill", icon: "🎨" },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-gray-200 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🗺️ Roadmap Customizer
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Query */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What do you want to plan/learn?
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-800 transition"
            placeholder="e.g. Full Stack Developer, Commerce Options after 10th..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Roadmap Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Roadmap Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("skill")}
              disabled={loading}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                type === "skill"
                  ? "bg-teal-50 text-teal-700 border-teal-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              💻 Skill Learning Path
            </button>
            <button
              type="button"
              onClick={() => setType("career")}
              disabled={loading}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                type === "career"
                  ? "bg-teal-50 text-teal-700 border-teal-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              🎓 Career Stream Finder
            </button>
          </div>
        </div>

        {/* Level selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Starting Skill Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["Beginner", "Intermediate", "Advanced"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                disabled={loading}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  level === l
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Popular Templates
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(s.text, s.type)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 font-medium transition-all"
              >
                <span>{s.icon}</span>
                <span>{s.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold tracking-wide shadow-lg hover:shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Compiling Visual Roadmap...</span>
            </>
          ) : (
            <>
              <span>⚡ Generate Career Roadmap</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 font-medium mt-2">
          Consumes 10 account credits
        </p>
      </form>
    </div>
  );
};

export default RoadmapForm;
