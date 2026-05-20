import { parsePdfBuffer } from "../utils/parserUtils.js";

/**
 * Service to extract raw text content from uploaded file configurations.
 */
export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error("No file provided for extraction.");
  }

  if (file.mimetype === "application/pdf") {
    return await parsePdfBuffer(file.buffer);
  }

  throw new Error("Unsupported file type. Please upload a PDF or an Image.");
}
