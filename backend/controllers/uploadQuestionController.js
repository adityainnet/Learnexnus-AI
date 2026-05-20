import UserModel from "../models/user.model.js";
import { generateSmartQuestionsFromSource } from "../services/uploadQuestionService.js";
import { saveQuestionPaperHistory } from "../services/questionHistoryService.js";
import { formatUploadHistoryMetadata } from "../utils/uploadQuestionHistoryUtils.js";

/**
 * Controller to handle credit validation, smart question generation, and saving history.
 */
export const generateSmartQuestionsController = async (req, res) => {
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
      return res.status(404).json({ message: "User not found." });
    }

    // Check credits (10 credits required)
    if (user.credits < 10) {
      user.isCreditAvailable = false;
      await user.save();
      return res.status(403).json({ message: "Insufficient credits. Please purchase more." });
    }

    // 1. Generate questions via service
    const parsedQuestionContent = await generateSmartQuestionsFromSource({
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

    // 2. Format history metadata
    const metadata = formatUploadHistoryMetadata(uploadType, topic);

    // 3. Save to database using history service
    const savedQuestionPaper = await saveQuestionPaperHistory({
      user: user._id,
      topic,
      classLevel,
      examType,
      totalMarks,
      timeDuration,
      difficulty,
      sections,
      content: parsedQuestionContent,
      uploadType: metadata.uploadType,
      extractedTopic: metadata.extractedTopic,
      extractedText: text,
    });

    // 4. Deduct credits
    user.credits -= 10;
    if (user.credits <= 0) user.isCreditAvailable = false;
    await user.save();

    return res.status(200).json({
      questionPaper: parsedQuestionContent,
      questionId: savedQuestionPaper._id,
      creditsLeft: user.credits,
    });

  } catch (error) {
    console.error("generateSmartQuestionsController error:", error);
    return res.status(500).json({
      error: "Smart question generation failed",
      message: error.message,
    });
  }
};
