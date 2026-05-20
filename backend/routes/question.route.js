import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  generateQuestions,
  getMyQuestions,
  getSingleQuestion,
} from "../controllers/question.controller.js";

const questionRouter = express.Router();

questionRouter.post("/generate", isAuth, generateQuestions);
questionRouter.get("/my-questions", isAuth, getMyQuestions);
questionRouter.get("/:id", isAuth, getSingleQuestion);

export default questionRouter;
