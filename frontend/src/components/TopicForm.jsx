import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { generateNotes } from "../services/api";
import { useDispatch } from "react-redux";
import { updateCredits } from "../redux/userSlice.js"
const TopicForm = ({ setResult, setLoading, loading, setError }) => {
  const [topic, setTopic] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [examType, setExamType] = useState("");
  const [revisionMode, setRevisionMode] = useState(false);
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const [includeChart, setIncludeChart] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const dispatch = useDispatch()


  const handleSubmit = async () => {
    if (!topic.trim()) {
      setError("Please enter the topic");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const result = await generateNotes({
        topic,
        classLevel,
        examType,
        revisionMode,
        includeDiagram,
        includeChart,
      });
      setResult(result.data);
      setLoading(false);
      setClassLevel("")
      setTopic("")
      setExamType("")
      setIncludeChart(false)
      setRevisionMode(false)
      setIncludeDiagram(false)

      if (typeof result.creditsLeft === "number") {
        dispatch(updateCredits(result.creditsLeft))

      }


    } catch (error) {
      console.error(error);
      setError("Something went wrong while generating notes from server");
    }
  };


  useEffect(() => {
    if (!loading) {
      setProgress(0);
      setProgressText("");
      return;
    }

    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 8;
      if (value >= 95) {
        value = 95;
        setProgressText("Almost done…");
        clearInterval(interval);
      } else if (value > 70) {
        setProgressText("Finalizing notes…");
      } else if (value > 40) {
        setProgressText("Processing content…");
      } else {
        setProgressText("Generating notes…");
      }
      setProgress(Math.floor(value))
    }, 700)
    return () => {
      clearInterval(interval);
    };
  }, [loading]);

  return (
    <motion.form // Changed from motion.div to motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.75)] p-8 space-y-6 text-white"
    >
      <input
        type="text"
        required
        className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        placeholder="Enter topic (e.g. Web Development)"
        onChange={(e) => setTopic(e.target.value)}
        value={topic}
      />
      <input
        type="text"
        className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        placeholder="Class / Level (e.g. Class 10)"
        onChange={(e) => setClassLevel(e.target.value)}
        value={classLevel}
      />
      <input
        type="text"
        className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        placeholder="Exam Type (e.g. CBSE, JEE, NEET)"
        onChange={(e) => setExamType(e.target.value)}
        value={examType}
      />

      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <Toggle
          label="Revision Mode"
          checked={revisionMode}
          onChange={() => setRevisionMode(!revisionMode)}
        />
        <Toggle
          label="Include Diagram"
          checked={includeDiagram}
          // FIX: Changed from setRevisionMode to setIncludeDiagram
          onChange={() => setIncludeDiagram(!includeDiagram)}
        />
        <Toggle
          label="Include Charts"
          checked={includeChart}
          // FIX: Changed from setRevisionMode to setIncludeChart
          onChange={() => setIncludeChart(!includeChart)}
        />
      </div>

      <motion.button
        onClick={handleSubmit}
        type="submit"
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        disabled={loading}
        className={`w-full mt-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${loading
          ? "bg-white/10 text-gray-400 cursor-not-allowed border border-white/10"
          : "bg-gradient-to-br from-white to-gray-200 text-black shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_35px_rgba(255,255,255,0.2)]"
          }`}
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"
            />
            Generating Notes...
          </>
        ) : (
          "Generate Notes"
        )}
      </motion.button>

      {/* Progress show  */}
      {loading &&
        <div className='mt-4 space-y-2'>
          <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.6 }}
              className='h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500'>
            </motion.div>
          </div>
          <div className='flex justify-between text-xs text-gray-300'>
            <span>{progressText}</span>
            <span>{progress}%</span>
          </div>
          <p className='text-xs text-gray-400 text-center'>
            This may take up to 5 minutes. Please don't close or refresh the page.
          </p>
        </div>
      }

    </motion.form>
  );
};

function Toggle({ label, checked, onChange }) {
  return (
    <div
      className="flex items-center gap-3 cursor-pointer select-none group"
      onClick={onChange}
    >
      <motion.div
        animate={{
          backgroundColor: checked
            ? "rgba(34,197,94,0.35)" // green when ON
            : "rgba(255,255,255,0.15)", // gray when OFF
        }}
        transition={{ duration: 0.25 }}
        // FIX: Used Flexbox to position the dot instead of absolute positioning
        className="w-12 h-6 rounded-full border border-white/20 backdrop-blur-lg flex items-center px-[2px]"
      >
        <motion.div
          animate={{ x: checked ? 24 : 0 }} // FIX: Animating X translation instead of 'left' property
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="h-5 w-5 rounded-full bg-white shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
        />
      </motion.div>
      <span
        className={`text-sm transition-colors duration-300 ${checked ? "text-green-300" : "text-gray-400 group-hover:text-gray-200"
          }`}
      >
        {label}
      </span>

    </div>

  );

}

export default TopicForm;