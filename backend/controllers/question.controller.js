import Question from "../models/question.model.js";
import UserModel from "../models/user.model.js";
import { generateGeminiResponse } from "../services/gemini.services.js";
import { buildQuestionPrompt } from "../utils/questionPromptBuilder.js";

// ─── Generate Questions ───────────────────────────────────────────────────────
export const generateQuestions = async (req, res) => {
  try {
    const {
      topic,
      classLevel,
      examType,
      totalMarks,
      timeDuration,
      difficulty = "Medium",
      sections = { mcq: true, tf: false, short: true, long: true },
      mcqCount = 10,
      tfCount = 5,
      shortCount = 5,
      longCount = 3,
    } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.credits < 10) {
      user.isCreditAvailable = false;
      await user.save();
      return res.status(403).json({ message: "Insufficient credits" });
    }

    const prompt = buildQuestionPrompt({
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

    const aiResponse = await generateGeminiResponse(prompt);

    const saved = await Question.create({
      user: user._id,
      topic,
      classLevel,
      examType,
      totalMarks,
      timeDuration,
      difficulty,
      sections: {
        ...sections,
        mcqCount,
        tfCount,
        shortCount,
        longCount,
      },
      content: aiResponse,
    });

    user.credits -= 10;
    if (user.credits <= 0) user.isCreditAvailable = false;
    await user.save();

    return res.status(200).json({
      data: aiResponse,
      questionId: saved._id,
      creditsLeft: user.credits,
    });
  } catch (error) {
    console.error("generateQuestions error:", error);
    res.status(500).json({
      error: "AI question generation failed",
      message: error.message,
    });
  }
};

// ─── Get All Questions for User ───────────────────────────────────────────────
export const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ user: req.userId })
      .select("topic classLevel examType totalMarks timeDuration difficulty sections createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: `getMyQuestions error: ${error}` });
  }
};

// ─── Get Single Question Set ──────────────────────────────────────────────────
export const getSingleQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!question) {
      return res.status(404).json({ error: "Question set not found" });
    }

    return res.json({
      content: question.content,
      topic: question.topic,
      createdAt: question.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: `getSingleQuestion error: ${error}` });
  }
};
