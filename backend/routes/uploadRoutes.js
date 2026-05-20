import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth.js";
import { handleFileUpload } from "../controllers/uploadController.js";
import { handleTextExtraction } from "../controllers/extractionController.js";
import { analyzeExtractedText } from "../controllers/questionAnalysisController.js";
import { generateSmartQuestionsController } from "../controllers/uploadQuestionController.js";

const uploadRoutes = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// File upload & PDF text extraction
uploadRoutes.post("/file", isAuth, upload.single("file"), handleFileUpload);

// Manual raw text preprocessing
uploadRoutes.post("/extract", isAuth, handleTextExtraction);

// AI topic / difficulty / suggestions analysis
uploadRoutes.post("/analyze", isAuth, analyzeExtractedText);

// Final contextual question generator
uploadRoutes.post("/generate-smart", isAuth, generateSmartQuestionsController);

export default uploadRoutes;
