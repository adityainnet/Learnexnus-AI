/**
 * Controller to handle raw text extraction or preprocessing.
 */
export const handleTextExtraction = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text content is required." });
    }

    // Sanitize and trim extracted content
    const sanitizedText = text.trim();

    return res.status(200).json({
      text: sanitizedText,
      wordCount: sanitizedText.split(/\s+/).length,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Text preprocessing failed",
      message: error.message,
    });
  }
};
