import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  generateRoadmap,
  getMyRoadmaps,
  getSingleRoadmap,
} from "../controllers/roadmap.controller.js";

const roadmapRouter = express.Router();

roadmapRouter.post("/generate", isAuth, generateRoadmap);
roadmapRouter.get("/my-roadmaps", isAuth, getMyRoadmaps);
roadmapRouter.get("/:id", isAuth, getSingleRoadmap);

export default roadmapRouter;
