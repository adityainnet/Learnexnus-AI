import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    classLevel: String,
    examType: String,
    totalMarks: String,
    timeDuration: String,
    difficulty: {
      type: String,
      default: "Medium",
    },
    sections: {
      type: mongoose.Schema.Types.Mixed, // Stores toggled sections and counts
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // AI response JSON
      required: true,
    },
    uploadType: {
      type: String,
      enum: ["image", "pdf", "text", "none"],
      default: "none",
    },
    extractedTopic: {
      type: String,
    },
    extractedText: {
      type: String,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
