/**
 * Utility helper to format metadata fields for upload-based question history.
 */
export const formatUploadHistoryMetadata = (uploadType, topic) => {
  const normalizedType = ["image", "pdf", "text"].includes(uploadType)
    ? uploadType
    : "text";

  return {
    uploadType: normalizedType,
    extractedTopic: topic || "Smart Analysis Topic",
    createdAt: new Date(),
  };
};
