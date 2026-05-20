import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

export const getCurrentUser = async (dispatch) => {
  try {
    const result = await axios.get(serverUrl + "/api/user/currentUser", {
      withCredentials: true,
    });
    dispatch(setUserData(result.data));
  } catch (error) {
    console.log(error);
  }
};

export const generateNotes = async (payload) => {
  try {
    const result = await axios.post(
      serverUrl + "/api/notes/generate-notes",
      payload,
      {
        withCredentials: true,
      },
    );
    console.log(result.data);
    return result.data;
  } catch (error) {
    console.log(error);
  }
};


export const downloadPdf = async (result) => {
  try {
    const response = await axios.post(
      serverUrl + "/api/pdf/generate-pdf",
      { result },                       // ✅ wrap result
      {
        responseType: "blob",
        withCredentials: true,
      }
    );

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ExamNotesAI.pdf";
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF download failed:", error);
  }
};

export const generateQuestions = async (payload) => {
  try {
    const result = await axios.post(
      serverUrl + "/api/questions/generate",
      payload,
      { withCredentials: true }
    );
    return result.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const generateRoadmap = async (payload) => {
  try {
    const result = await axios.post(
      serverUrl + "/api/roadmaps/generate",
      payload,
      { withCredentials: true }
    );
    return result.data;
  } catch (error) {
    console.error("generateRoadmap api error:", error);
    throw error;
  }
};

export const getMyRoadmaps = async () => {
  try {
    const result = await axios.get(
      serverUrl + "/api/roadmaps/my-roadmaps",
      { withCredentials: true }
    );
    return result.data;
  } catch (error) {
    console.error("getMyRoadmaps api error:", error);
    throw error;
  }
};

export const getSingleRoadmap = async (id) => {
  try {
    const result = await axios.get(
      serverUrl + `/api/roadmaps/${id}`,
      { withCredentials: true }
    );
    return result.data;
  } catch (error) {
    console.error("getSingleRoadmap api error:", error);
    throw error;
  }
};