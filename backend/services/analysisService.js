import { buildTextAnalysisPrompt } from "./smartQuestionPromptBuilder.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_PRIMARY = "gemini-2.5-flash";

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_PRIMARY}:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`STATUS_${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No text returned from Gemini API");
  }

  return text;
}

function cleanAndParseJSON(text) {
  let cleanText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleanText.indexOf("{");
  const end = cleanText.lastIndexOf("}");

  if (start !== -1 && end !== -1) {
    cleanText = cleanText.substring(start, end + 1);
  }

  return JSON.parse(cleanText);
}

/**
 * Service to analyze extracted text using Gemini.
 */
export async function analyzeExtractedTextService(text) {
  if (!text || !text.trim()) {
    throw new Error("Cannot analyze empty text.");
  }

  try {
    const prompt = buildTextAnalysisPrompt(text);
    const rawResponse = await callGemini(prompt);
    const parsedData = cleanAndParseJSON(rawResponse);

    return {
      detectedTopic: parsedData.detectedTopic || "General Topic",
      concepts: parsedData.concepts || [],
      estimatedDifficulty: parsedData.estimatedDifficulty || "Medium",
      suggestions: parsedData.suggestions || [],
    };
  } catch (error) {
    console.error("analyzeExtractedTextService error:", error);
    // Return a default structure on failure to prevent crashing the flow
    return {
      detectedTopic: "Extracted Topic",
      concepts: ["Key Concepts"],
      estimatedDifficulty: "Medium",
      suggestions: ["Conceptual Questions", "HOTS Questions"],
    };
  }
}
