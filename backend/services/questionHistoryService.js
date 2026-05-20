import Question from "../models/question.model.js";

/**
 * Service to manage question paper history operations.
 */
export const saveQuestionPaperHistory = async (saveData) => {
  return await Question.create(saveData);
};
