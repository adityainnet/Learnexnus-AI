import { extractTextFromFile } from "../services/extractionService.js";

/**
 * Controller to manage files (PDFs, docs) uploaded for smart analysis.
 */
export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded." });
    }

    const text = await extractTextFromFile(req.file);
    return res.status(200).json({ text });
  } catch (error) {
    console.error("handleFileUpload error:", error);
    return res.status(500).json({
      error: "Extraction failed",
      message: error.message,
    });
  }
};
