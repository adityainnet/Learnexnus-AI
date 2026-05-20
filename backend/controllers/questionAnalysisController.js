import UserModel from "../models/user.model.js";
import Question from "../models/question.model.js";
import { analyzeExtractedTextService } from "../services/analysisService.js";
import { buildSmartQuestionPrompt } from "../services/smartQuestionPromptBuilder.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_PRIMARY = "gemini-2.5-flash";

async function generateSmartAIQuestions(prompt) {
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

// ─── Analyze Extracted Text ──────────────────────────────────────────────────
export const analyzeExtractedText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text content is required for analysis." });
    }

    const analysis = await analyzeExtractedTextService(text);
    return res.status(200).json(analysis);
  } catch (error) {
    console.error("analyzeExtractedText error:", error);
    return res.status(500).json({
      error: "Smart analysis failed",
      message: error.message,
    });
  }
};

// ─── Generate Smart Questions From Text Context ─────────────────────────────────
export const generateSmartQuestions = async (req, res) => {
  try {
    const {
      text,
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
      uploadType = "text",
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reference text is required for smart question generation." });
    }

    if (!topic) {
      return res.status(400).json({ message: "Topic name is required." });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Check credits (10 credits required)
    if (user.credits < 10) {
      user.isCreditAvailable = false;
      await user.save();
      return res.status(403).json({ message: "Insufficient credits. Please top up." });
    }

    // Build the AI prompt referencing the document text
    const prompt = buildSmartQuestionPrompt({
      text,
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

    // Request Gemini response
    const rawAiText = await generateSmartAIQuestions(prompt);
    const parsedQuestionContent = cleanAndParseJSON(rawAiText);

    // Save generated questions to the existing Question schema (with metadata)
    const savedQuestionPaper = await Question.create({
      user: user._id,
      topic,
      classLevel,
      examType,
      totalMarks,
      timeDuration,
      difficulty,
      sections,
      content: parsedQuestionContent,
      uploadType,
      extractedTopic: topic,
      extractedText: text,
    });

    // Deduct credits
    user.credits -= 10;
    if (user.credits <= 0) user.isCreditAvailable = false;
    await user.save();

    return res.status(200).json({
      questionPaper: parsedQuestionContent,
      questionId: savedQuestionPaper._id,
      creditsLeft: user.credits,
    });

  } catch (error) {
    console.error("generateSmartQuestions error:", error);
    return res.status(500).json({
      error: "Smart question generation failed",
      message: error.message,
    });
  }
};
