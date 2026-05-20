import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDb from "./utils/connectDb.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import notesRouter from "./routes/generate.route.js";
import pdfRouter from "./routes/pdf.route.js";
import creditRouter from "./routes/credits.route.js";
import questionRouter from "./routes/question.route.js";
import roadmapRouter from "./routes/roadmap.route.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { stripeWebhook } from "./controllers/credits.controller.js";

const PORT = process.env.PORT || 5000;

const app = express();
app.post(
  "/api/credits/webhook",
  express.raw({type:"application/json"}),
  stripeWebhook
)

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.json({ message: "ExamNotes Ai backand Running" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/notes", notesRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/credit", creditRouter);
app.use("/api/questions", questionRouter);
app.use("/api/questions/upload", uploadRoutes);
app.use("/api/roadmaps", roadmapRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDb();
});
