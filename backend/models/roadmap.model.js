import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["career", "skill"],
      default: "skill",
    },
    level: {
      type: String,
      default: "Beginner",
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // Stores the full structured JSON from Gemini
      required: true,
    },
  },
  { timestamps: true }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export default Roadmap;
