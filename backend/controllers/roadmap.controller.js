import Roadmap from "../models/roadmap.model.js";
import UserModel from "../models/user.model.js";
import { generateRoadmapService } from "../services/roadmap.service.js";
import { transformRoadmapToReactFlow } from "../utils/roadmapTransformer.js";

// ─── Generate Roadmap ──────────────────────────────────────────────────────────
export const generateRoadmap = async (req, res) => {
  try {
    const { type, query, level = "Beginner" } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Search query or career path is required." });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Credit limit validation (same pattern as Notes & Questions)
    if (user.credits < 10) {
      user.isCreditAvailable = false;
      await user.save();
      return res.status(403).json({ message: "Insufficient credits. Please top up." });
    }

    // Call service to generate content
    const roadmapJson = await generateRoadmapService({ type, query, level });

    // Persist to DB
    const savedRoadmap = await Roadmap.create({
      user: user._id,
      title: roadmapJson.title || query,
      description: roadmapJson.description || "",
      type: type || "skill",
      level: level,
      content: roadmapJson,
    });

    // Deduct credits
    user.credits -= 10;
    if (user.credits <= 0) user.isCreditAvailable = false;
    await user.save();

    // Map to React Flow node/edge design format
    const reactFlowData = transformRoadmapToReactFlow(roadmapJson);

    return res.status(200).json({
      roadmapId: savedRoadmap._id,
      roadmapData: roadmapJson,
      reactFlowData,
      creditsLeft: user.credits,
    });

  } catch (error) {
    console.error("generateRoadmap error:", error);
    return res.status(500).json({
      error: "AI roadmap generation failed",
      message: error.message,
    });
  }
};

// ─── Get All User Roadmaps ─────────────────────────────────────────────────────
export const getMyRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.userId })
      .select("title description type level createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(roadmaps);
  } catch (error) {
    return res.status(500).json({ message: `getMyRoadmaps error: ${error.message}` });
  }
};

// ─── Get Single Roadmap Detail ────────────────────────────────────────────────
export const getSingleRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found." });
    }

    // Compute React Flow format on the fly if needed
    const reactFlowData = transformRoadmapToReactFlow(roadmap.content);

    return res.json({
      title: roadmap.title,
      description: roadmap.description,
      type: roadmap.type,
      level: roadmap.level,
      content: roadmap.content,
      reactFlowData,
      createdAt: roadmap.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: `getSingleRoadmap error: ${error.message}` });
  }
};
