import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { createWorker } from "tesseract.js";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateCredits } from "../redux/userSlice.js";
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  CheckCircle,
  HelpCircle,
  Clock,
  Award
} from "lucide-react";

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

const SmartQuestionForm = ({ setResult, setLoading, loading, setError }) => {
  const dispatch = useDispatch();
  
  // Tab states
  const [activeInputTab, setActiveInputTab] = useState("image"); // "image" | "pdf" | "text"
  
  // Extraction states
  const [extractedText, setExtractedText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [fileName, setFileName] = useState("");

  // Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Form customizer states
  const [topic, setTopic] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [examType, setExamType] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [timeDuration, setTimeDuration] = useState("3 Hours");
  const [difficulty, setDifficulty] = useState("Medium");
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
  
  // Generation loader text
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationText, setGenerationText] = useState("");

  // Clean form state
  const resetExtraction = () => {
    setExtractedText("");
    setFileName("");
    setAnalysisResult(null);
    setTopic("");
  };

  // Image dropzone callback & OCR
  const onDropImage = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    setExtracting(true);
    setOcrProgress(0);
    setError("");

    try {
      setOcrStatus("Initializing Tesseract OCR worker...");
      const worker = await createWorker("eng");
      
      // Update OCR progress
      setOcrStatus("Processing image pixels...");
      const ret = await worker.recognize(file);
      setExtractedText(ret.data.text);
      await worker.terminate();
      
      setOcrStatus("Extraction complete!");
      setExtracting(false);
    } catch (err) {
      console.error("OCR Error:", err);
      setError("Failed to extract text from image. Please check the image or type manually.");
      setExtracting(false);
    }
  }, [setError]);

  // PDF dropzone callback
  const onDropPdf = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    setExtracting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post(`${serverUrl}/api/questions/upload/file`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setExtractedText(response.data.text);
      setExtracting(false);
    } catch (err) {
      console.error("PDF Upload Error:", err);
      setError("Failed to parse PDF on the server. Please try a different document.");
      setExtracting(false);
    }
  }, [setError]);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onDropImage,
    accept: { "image/*": [] },
    multiple: false,
  });

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: onDropPdf,
    accept: { "application/pdf": [] },
    multiple: false,
  });

  // AI analysis of text
  const handleAnalyzeText = async () => {
    if (!extractedText.trim()) {
      setError("Extracted text is empty. Add some text first.");
      return;
    }

    setAnalyzing(true);
    setError("");
    try {
      const res = await axios.post(`${serverUrl}/api/questions/upload/analyze`, {
        text: extractedText
      }, { withCredentials: true });

      setAnalysisResult(res.data);
      setTopic(res.data.detectedTopic);
      setDifficulty(res.data.estimatedDifficulty);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError("AI analysis failed to process text. You can still set the topic manually.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Submit contextual question generation
  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    if (!extractedText.trim()) {
      setError("Please input or extract text first.");
      return;
    }
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
      const res = await axios.post(`${serverUrl}/api/questions/upload/generate-smart`, {
        text: extractedText,
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
        uploadType: activeInputTab,
      }, { withCredentials: true });

      setResult(res.data.questionPaper);
      setLoading(false);

      if (typeof res.data.creditsLeft === "number") {
        dispatch(updateCredits(res.data.creditsLeft));
      }
    } catch (err) {
      console.error("Smart Generation Error:", err);
      setLoading(false);
      const msg = err?.response?.status === 403
        ? "Insufficient credits. Please buy more credits."
        : "Failed to generate smart questions. Please try again.";
      setError(msg);
    }
  };

  // Progress loader timer
  useEffect(() => {
    if (!loading) {
      setGenerationProgress(0);
      setGenerationText("");
      return;
    }

    let val = 0;
    const interval = setInterval(() => {
      val += Math.random() * 9;
      if (val >= 95) {
        val = 95;
        setGenerationText("Finalizing paper formatting...");
        clearInterval(interval);
      } else if (val > 75) setGenerationText("Polishing conceptual Q&As...");
      else if (val > 45) setGenerationText("Analyzing source context...");
      else setGenerationText("Reading reference material...");
      setGenerationProgress(Math.floor(val));
    }, 600);

    return () => clearInterval(interval);
  }, [loading]);

  const sectionConfig = [
    { key: "mcq", icon: "🔘", label: "Multiple Choice (MCQ)", count: mcqCount, setCount: setMcqCount },
    { key: "tf", icon: "✅", label: "True / False", count: tfCount, setCount: setTfCount },
    { key: "short", icon: "✏️", label: "Short Answer", count: shortCount, setCount: setShortCount },
    { key: "long", icon: "📄", label: "Long Answer", count: longCount, setCount: setLongCount },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-black/90 via-black/80 to-black/90 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.75)] p-8 space-y-6 text-white">
      
      {/* Tab select header */}
      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
        <button
          type="button"
          onClick={() => { setActiveInputTab("image"); resetExtraction(); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeInputTab === "image" ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Image (OCR)
        </button>
        <button
          type="button"
          onClick={() => { setActiveInputTab("pdf"); resetExtraction(); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeInputTab === "pdf" ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => { setActiveInputTab("text"); resetExtraction(); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeInputTab === "text" ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Paste Notes
        </button>
      </div>

      {/* Input dropzones */}
      <AnimatePresence mode="wait">
        {activeInputTab === "image" && (
          <motion.div
            key="image-zone"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div
              {...getImageRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                isImageDragActive ? "border-emerald-400 bg-emerald-500/5" : "border-white/20 hover:border-white/40"
              }`}
            >
              <input {...getImageInputProps()} />
              <UploadCloud className="w-10 h-10 mx-auto mb-3 text-gray-400 animate-bounce" />
              <p className="text-sm font-medium mb-1">
                Drag & drop your handwritten note or textbook screenshot
              </p>
              <p className="text-xs text-gray-500">Supports PNG, JPG, JPEG up to 10MB</p>
            </div>
          </motion.div>
        )}

        {activeInputTab === "pdf" && (
          <motion.div
            key="pdf-zone"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div
              {...getPdfRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                isPdfDragActive ? "border-emerald-400 bg-emerald-500/5" : "border-white/20 hover:border-white/40"
              }`}
            >
              <input {...getPdfInputProps()} />
              <UploadCloud className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium mb-1">
                Drag & drop your question paper or document PDF
              </p>
              <p className="text-xs text-gray-500">PDF up to 10MB</p>
            </div>
          </motion.div>
        )}

        {activeInputTab === "text" && (
          <motion.div
            key="text-zone"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-2"
          >
            <label className="text-xs text-gray-400 uppercase tracking-wider block">
              ✍️ Paste Reference Content / Study Material
            </label>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Paste raw text, concepts, syllabus topics or lecture notes here..."
              className="w-full h-36 p-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm resize-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* OCR/Extraction status and progress indicator */}
      {extracting && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-3 w-3 border-2 border-emerald-400 border-t-transparent rounded-full"
              />
              {ocrStatus || "Reading document structure..."}
            </span>
          </div>
        </div>
      )}

      {/* Extracted file name & manual text trigger */}
      {fileName && !extracting && (
        <div className="text-xs flex justify-between items-center bg-white/5 border border-white/10 p-2.5 rounded-lg">
          <span className="truncate max-w-[200px] text-gray-400">📄 {fileName}</span>
          <button onClick={resetExtraction} className="text-red-400 font-semibold hover:underline">
            Remove
          </button>
        </div>
      )}

      {/* Editable extracted text pane (only for image/pdf) */}
      {extractedText && activeInputTab !== "text" && !extracting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-400 uppercase tracking-wider block">
              📝 Extracted Readable Text
            </label>
            <span className="text-[10px] text-gray-500">Edit text if OCR made errors</span>
          </div>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full h-32 p-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-xs font-mono"
          />
        </motion.div>
      )}

      {/* Trigger Smart Analysis */}
      {extractedText && !extracting && !analysisResult && (
        <motion.button
          type="button"
          onClick={handleAnalyzeText}
          disabled={analyzing}
          className="w-full py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          {analyzing ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-3.5 w-3.5 border-2 border-white/50 border-t-transparent rounded-full"
              />
              Analyzing concepts...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Analyze Text & Detect Concepts
            </>
          )}
        </motion.button>
      )}

      {/* AI Analysis Preview */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3"
        >
          <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            AI Document Analysis
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Detected Topic:</span>
              <span className="font-semibold text-white">{analysisResult.detectedTopic}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Complexity Rating:</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium capitalize">
                {analysisResult.estimatedDifficulty}
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-1">Key Concepts Found:</span>
            <div className="flex flex-wrap gap-1.5">
              {analysisResult.concepts?.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-gray-300">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Question paper inputs */}
      {extractedText && !extracting && (
        <motion.form
          onSubmit={handleGenerateQuestions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 pt-2 border-t border-white/10"
        >
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
              📚 Subject / Topic Title
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Specify the topic title..."
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Award className="w-3 h-3 text-gray-400" /> Class Level
              </label>
              <input
                type="text"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                placeholder="e.g. Class 12"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
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
                placeholder="e.g. Midterm, Quiz"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
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
                className="w-full p-3 rounded-xl bg-black/60 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {["30", "50", "70", "80", "100"].map((m) => (
                  <option key={m} value={m}>{m} Marks</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" /> Time Limit
              </label>
              <select
                value={timeDuration}
                onChange={(e) => setTimeDuration(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
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
            <div className="flex gap-2">
              {["Easy", "Medium", "Hard", "Mixed"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                    difficulty === d
                      ? "bg-white text-black border-white"
                      : "bg-white/10 text-gray-300 border-white/20 hover:border-white/45"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Sections list */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2.5 block">
              📋 Enable Sections & Question Counts
            </label>
            <div className="space-y-2">
              {sectionConfig.map(({ key, icon, label, count, setCount }) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    sections[key] ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={sections[key]}
                      onChange={() => setSections((prev) => ({ ...prev, [key]: !prev[key] }))}
                    />
                    <span className="text-xs">{icon} {label}</span>
                  </div>
                  {sections[key] && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCount((c) => Math.max(1, c - 1))}
                        className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs"
                      >−</button>
                      <span className="w-4 text-center text-xs">{count}</span>
                      <button
                        type="button"
                        onClick={() => setCount((c) => Math.min(20, c + 1))}
                        className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs"
                      >+</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generate smart question paper */}
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition duration-300 ${
              loading
                ? "bg-white/10 text-gray-400 cursor-not-allowed border border-white/10"
                : "bg-gradient-to-br from-emerald-400 to-green-500 text-black shadow-[0_15px_35px_rgba(16,185,129,0.3)]"
            }`}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"
                />
                Generating from source...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Smart Q&A Sheet (10 credits)
              </>
            )}
          </motion.button>

          {/* Progress bar */}
          {loading && (
            <div className="space-y-2">
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-400"
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>{generationText}</span>
                <span>{generationProgress}%</span>
              </div>
            </div>
          )}
        </motion.form>
      )}
    </div>
  );
};

export default SmartQuestionForm;
