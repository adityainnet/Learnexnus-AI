import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { serverUrl } from "./../App";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { GiHamburgerMenu } from "react-icons/gi";
import FinalResult from "../components/FinalResult.jsx";
import QuestionResult from "../components/QuestionResult.jsx";
import RoadmapResult from "../components/RoadmapResult.jsx";

// ─── Formatting Helper ────────────────────────────────────────────────────────
const formatTimestamp = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Notes History Card ───────────────────────────────────────────────────────
const NoteHistoryCard = ({ item, isActive, onClick }) => {
  return (
    <motion.li
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-xl border transition-all space-y-2 text-start ${
        isActive
          ? "bg-indigo-500/20 border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm font-semibold text-white truncate flex-1">
          {item.topic}
        </p>
        <span className="text-[10px] text-gray-400 shrink-0 font-medium">
          {formatTimestamp(item.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[10px]">
        {item.classLevel && (
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            {item.classLevel}
          </span>
        )}
        {item.examType && (
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            {item.examType}
          </span>
        )}
      </div>

      <div className="flex gap-2 text-[10px] text-gray-400 border-t border-white/5 pt-2">
        {item.revisionMode && <span>⚡ Revision</span>}
        {item.includeDiagram && <span>📊 Diagram</span>}
        {item.includeChart && <span>📉 Chart</span>}
      </div>
    </motion.li>
  );
};

// ─── Questions History Card ──────────────────────────────────────────────────
const QuestionHistoryCard = ({ item, isActive, onClick }) => {
  // Construct a short preview list of active sections
  const activeSections = [];
  if (item.sections?.mcq) activeSections.push("MCQs");
  if (item.sections?.tf) activeSections.push("True/False");
  if (item.sections?.short) activeSections.push("Short Ans");
  if (item.sections?.long) activeSections.push("Long Ans");
  const previewText = activeSections.length > 0 
    ? `Includes: ${activeSections.join(", ")}` 
    : "Custom practice paper";

  return (
    <motion.li
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-xl border transition-all space-y-2 text-start ${
        isActive
          ? "bg-teal-500/20 border-teal-400/50 shadow-[0_0_15px_rgba(20,184,166,0.25)]"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm font-semibold text-white truncate flex-1">
          {item.topic}
        </p>
        <span className="text-[10px] text-gray-400 shrink-0 font-medium">
          {formatTimestamp(item.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold uppercase tracking-wider text-[8px]">
          {item.difficulty || "Mixed"}
        </span>
        {item.classLevel && (
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            {item.classLevel}
          </span>
        )}
      </div>

      <p className="text-[11px] text-gray-400 italic line-clamp-1 border-t border-white/5 pt-2">
        {previewText}
      </p>
    </motion.li>
  );
};

// ─── Roadmaps History Card ───────────────────────────────────────────────────
const RoadmapHistoryCard = ({ item, isActive, onClick }) => {
  return (
    <motion.li
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-xl border transition-all space-y-2 text-start ${
        isActive
          ? "bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm font-semibold text-white truncate flex-1">
          {item.title}
        </p>
        <span className="text-[10px] text-gray-400 shrink-0 font-medium">
          {formatTimestamp(item.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider text-[8px]">
          {item.level || "Beginner"}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 capitalize">
          {item.type === "career" ? "🎓 Career Stream" : "💻 Skill Path"}
        </span>
      </div>

      {item.description && (
        <p className="text-[11px] text-gray-400 line-clamp-1 border-t border-white/5 pt-2">
          {item.description}
        </p>
      )}
    </motion.li>
  );
};

// ─── Main History Component ──────────────────────────────────────────────────
function History() {
  const [notesList, setNotesList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [roadmapsList, setRoadmapsList] = useState([]);
  const [activeTab, setActiveTab] = useState("notes"); // "notes" | "questions" | "roadmaps"
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const credits = userData?.credits || 0;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null); // "note" | "question" | "roadmap"
  const [loading, setLoading] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // Fetch Notes
      try {
        const res = await axios.get(serverUrl + "/api/notes/getnotes", {
          withCredentials: true,
        });
        const sortedNotes = (Array.isArray(res.data) ? res.data : []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotesList(sortedNotes);
      } catch (error) {
        console.error("Notes history fetch error:", error);
      }

      // Fetch Questions
      try {
        const res = await axios.get(serverUrl + "/api/questions/my-questions", {
          withCredentials: true,
        });
        const sortedQuestions = (Array.isArray(res.data) ? res.data : []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setQuestionsList(sortedQuestions);
      } catch (error) {
        console.error("Questions history fetch error:", error);
      }

      // Fetch Roadmaps
      try {
        const res = await axios.get(serverUrl + "/api/roadmaps/my-roadmaps", {
          withCredentials: true,
        });
        const sortedRoadmaps = (Array.isArray(res.data) ? res.data : []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRoadmapsList(sortedRoadmaps);
      } catch (error) {
        console.error("Roadmaps history fetch error:", error);
      }
    };

    fetchHistory();
  }, []);

  const openItem = async (itemId, itemType) => {
    setLoading(true);
    setActiveItemId(itemId);
    setSelectedItemType(itemType);

    try {
      console.log(`Clicked ${itemType}:`, itemId);
      const url =
        itemType === "note"
          ? `${serverUrl}/api/notes/${itemId}`
          : itemType === "question"
          ? `${serverUrl}/api/questions/${itemId}`
          : `${serverUrl}/api/roadmaps/${itemId}`;

      const res = await axios.get(url, { withCredentials: true });
      if (itemType === "roadmap") {
        setSelectedItem({
          roadmapData: res.data.content,
          reactFlowData: res.data.reactFlowData,
        });
      } else {
        setSelectedItem(res.data.content);
      }
    } catch (error) {
      console.error("Item fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-6 py-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 px-8 py-6 items-start flex justify-between md:items-center gap-4 flex-wrap shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
      >
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
            ExamNotes AI
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Ai-Powered Exam History & Dashboard
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-white text-2xl"
            >
              <GiHamburgerMenu />
            </button>
          )}
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
        </div>
      </motion.header>

      {/* Content Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed lg:static top-0 left-0 z-50 lg:z-auto w-72 lg:w-auto h-full lg:h-[75vh] lg:rounded-3xl lg:col-span-1 bg-black/90 lg:bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.6)] p-5 overflow-y-auto"
            >
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-white mb-4"
              >
                ⬅️ back
              </button>
              <div className="mb-4 space-y-1">
                {/* Generation Quick Links */}
                <div className="flex gap-1.5 mb-4">
                  <button
                    onClick={() => navigate("/notes")}
                    className="flex-1 px-2 py-2 rounded-lg text-[10px] text-gray-200 bg-white/10 text-center hover:bg-white/20 transition font-medium"
                  >
                    📝 Notes
                  </button>
                  <button
                    onClick={() => navigate("/questions")}
                    className="flex-1 px-2 py-2 rounded-lg text-[10px] text-gray-200 bg-white/10 text-center hover:bg-white/20 transition font-medium"
                  >
                    🧠 Questions
                  </button>
                  <button
                    onClick={() => navigate("/roadmap")}
                    className="flex-1 px-2 py-2 rounded-lg text-[10px] text-gray-200 bg-white/10 text-center hover:bg-white/20 transition font-medium"
                  >
                    🗺️ Roadmaps
                  </button>
                </div>

                <hr className="border-white/10 mb-4" />

                {/* Switcher Tab Header */}
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-4">
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`flex-1 py-2 text-[10px] font-semibold rounded-lg transition-all ${
                      activeTab === "notes"
                        ? "bg-white text-black shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    📝 Notes
                  </button>
                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`flex-1 py-2 text-[10px] font-semibold rounded-lg transition-all ${
                      activeTab === "questions"
                        ? "bg-white text-black shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    🧠 Questions
                  </button>
                  <button
                    onClick={() => setActiveTab("roadmaps")}
                    className={`flex-1 py-2 text-[10px] font-semibold rounded-lg transition-all ${
                      activeTab === "roadmaps"
                        ? "bg-white text-black shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    🗺️ Roadmaps
                  </button>
                </div>

                {/* History Lists */}
                {activeTab === "notes" ? (
                  <div>
                    <h3 className="mb-3 text-xs uppercase tracking-wider font-bold text-gray-400 px-1">
                      Saved Notes List
                    </h3>
                    {notesList.length === 0 ? (
                      <p className="text-sm text-gray-400 px-1">No notes created yet</p>
                    ) : (
                      <ul className="space-y-3">
                        {notesList.map((item) => (
                          <NoteHistoryCard
                            key={item._id}
                            item={item}
                            isActive={activeItemId === item._id}
                            onClick={() => openItem(item._id, "note")}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                ) : activeTab === "questions" ? (
                  <div>
                    <h3 className="mb-3 text-xs uppercase tracking-wider font-bold text-gray-400 px-1">
                      Generated Question Sheets
                    </h3>
                    {questionsList.length === 0 ? (
                      <p className="text-sm text-gray-400 px-1">No question papers created yet</p>
                    ) : (
                      <ul className="space-y-3">
                        {questionsList.map((item) => (
                          <QuestionHistoryCard
                            key={item._id}
                            item={item}
                            isActive={activeItemId === item._id}
                            onClick={() => openItem(item._id, "question")}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="mb-3 text-xs uppercase tracking-wider font-bold text-gray-400 px-1">
                      Generated AI Roadmaps
                    </h3>
                    {roadmapsList.length === 0 ? (
                      <p className="text-sm text-gray-400 px-1">No roadmaps created yet</p>
                    ) : (
                      <ul className="space-y-3">
                        {roadmapsList.map((item) => (
                          <RoadmapHistoryCard
                            key={item._id}
                            item={item}
                            isActive={activeItemId === item._id}
                            onClick={() => openItem(item._id, "roadmap")}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detail Pane */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-3 rounded-2xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] p-6 min-h-[75vh]"
        >
          {loading && <p className="text-center text-gray-500 py-10">Loading saved item...</p>}

          {!loading && !selectedItem && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[60vh]">
              <span className="text-5xl mb-4">📂</span>
              <p className="text-sm">Select an item from the Sidebar history to view details</p>
            </div>
          )}

          {!loading && selectedItem && selectedItemType === "note" && (
            <FinalResult result={selectedItem} />
          )}

          {!loading && selectedItem && selectedItemType === "question" && (
            <QuestionResult result={selectedItem} />
          )}

          {!loading && selectedItem && selectedItemType === "roadmap" && (
            <RoadmapResult result={selectedItem} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default History;
