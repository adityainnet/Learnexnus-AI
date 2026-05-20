import { buildSmartQuestionPrompt } from "./smartQuestionPromptBuilder.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_PRIMARY = "gemini-2.5-flash";

async function callGeminiAPI(prompt) {
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
 * Service to generate smart questions from reference text context using Gemini.
 */
export const generateSmartQuestionsFromSource = async (criteria) => {
  const prompt = buildSmartQuestionPrompt(criteria);
  const rawAiText = await callGeminiAPI(prompt);
  return cleanAndParseJSON(rawAiText);
};
