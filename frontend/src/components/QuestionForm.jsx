import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateQuestions } from "../services/api";
import { useDispatch } from "react-redux";
import { updateCredits } from "../redux/userSlice.js";

// Toggle component matching original Question Paper UI
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full border border-white/20 flex items-center px-[2px] transition-colors ${
        checked ? "bg-green-500/30" : "bg-white/10"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

const QuestionForm = ({ setResult, setLoading, loading, setError }) => {
  const dispatch = useDispatch();
  const [topic, setTopic] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [examType, setExamType] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [timeDuration, setTimeDuration] = useState("3 Hours");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [sections, setSections] = useState({
    mcq: true,
    tf: false,
    short: true,
    long: true,
  });
  const [mcqCount, setMcqCount] = useState(10);
  const [tfCount, setTfCount] = useState(5);
  const [shortCount, setShortCount] = useState(5);
  const [longCount, setLongCount] = useState(3);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a subject or topic.");
      return;
    }
    if (!sections.mcq && !sections.tf && !sections.short && !sections.long) {
      setError("Please enable at least one question section.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const result = await generateQuestions({
        topic,
        classLevel,
        examType,
        totalMarks,
        timeDuration,
        difficulty,
        sections,
        mcqCount,
        tfCount,
        shortCount,
        longCount,
      });

      setResult(result.data);
      setLoading(false);
      
      if (typeof result.creditsLeft === "number") {
        dispatch(updateCredits(result.creditsLeft));
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      const msg = err?.response?.status === 403
        ? "Insufficient credits. Please buy more credits."
        : "Failed to generate questions. Please try again.";
      setError(msg);
    }
  };

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setProgressText("");
      return;
    }

    let val = 0;
    const interval = setInterval(() => {
      val += Math.random() * 8;
      if (val >= 95) {
        val = 95;
        setProgressText("Almost done...");
        clearInterval(interval);
      } else if (val > 70) setProgressText("Finalizing question structure...");
      else if (val > 40) setProgressText("Generating questions...");
      else setProgressText("Connecting to Gemini AI...");
      setProgress(Math.floor(val));
    }, 700);

    return () => clearInterval(interval);
  }, [loading]);

  const sectionConfig = [
    { key: "mcq", icon: "🔘", label: "Multiple Choice (MCQ)", count: mcqCount, setCount: setMcqCount },
    { key: "tf", icon: "✅", label: "True / False", count: tfCount, setCount: setTfCount },
    { key: "short", icon: "✏️", label: "Short Answer", count: shortCount, setCount: setShortCount },
    { key: "long", icon: "📄", label: "Long Answer", count: longCount, setCount: setLongCount },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-black/90 via-black/80 to-black/90
        border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.75)] p-8 space-y-5 text-white"
    >
      {/* Topic */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
          📚 Subject / Topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Photosynthesis, Algebra, World War II..."
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20
            placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
            🎓 Class / Level
          </label>
          <input
            type="text"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            placeholder="e.g. Class 10"
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20
              placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
            📋 Exam Type
          </label>
          <input
            type="text"
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            placeholder="e.g. CBSE, JEE, NEET"
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20
              placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
            📊 Total Marks
          </label>
          <select
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/60 border border-white/20
              text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {["30", "50", "70", "80", "100"].map((m) => (
              <option key={m} value={m}>{m} Marks</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
            ⏱️ Duration
          </label>
          <select
            value={timeDuration}
            onChange={(e) => setTimeDuration(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/60 border border-white/20
              text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {["1 Hour", "1.5 Hours", "2 Hours", "2.5 Hours", "3 Hours"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
          ⚡ Difficulty Level
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Easy", "Medium", "Hard", "Mixed"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                difficulty === d
                  ? "bg-white text-black border-white"
                  : "bg-white/10 text-gray-300 border-white/20 hover:border-white/40"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">
          📝 Question Sections
        </label>
        <div className="space-y-2">
          {sectionConfig.map(({ key, icon, label, count, setCount }) => (
            <div
              key={key}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                sections[key]
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Toggle
                  checked={sections[key]}
                  onChange={() =>
                    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                />
                <span className="text-sm">{icon} {label}</span>
              </div>
              {sections[key] && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCount((c) => Math.max(1, c - 1))}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
                  >−</button>
                  <span className="w-5 text-center text-sm">{count}</span>
                  <button
                    type="button"
                    onClick={() => setCount((c) => Math.min(20, c + 1))}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
                  >+</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
          loading
            ? "bg-white/10 text-gray-400 cursor-not-allowed border border-white/10"
            : "bg-gradient-to-br from-white to-gray-200 text-black shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_35px_rgba(255,255,255,0.15)]"
        }`}
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"
            />
            Generating Questions...
          </>
        ) : (
          "🧠 Generate Questions"
        )}
      </motion.button>

      {/* Progress Bar */}
      {loading && (
        <div className="space-y-2">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.6 }}
              className="h-full bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{progressText}</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
    </motion.form>
  );
};

export default QuestionForm;
