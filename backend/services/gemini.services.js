const Gemini_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";


export const generateGeminiResponse = async (prompt) => {
  try {
    console.log("Using URL:", Gemini_URL);

    const response = await fetch(
      `${Gemini_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    // 1️⃣ Remove markdown code blocks
    let cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 2️⃣ Extract only the JSON object
    const start = cleanText.indexOf("{");
    const end = cleanText.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      cleanText = cleanText.substring(start, end + 1);
    }

    // 3️⃣ Escape problematic quotes inside text (like —"things"—)
    cleanText = cleanText.replace(/—"([^"]+)"—/g, '—\\"$1\\"—');

    console.log("Gemini cleaned response:\n", cleanText);

    // 4️⃣ Safely parse JSON
    try {
      return JSON.parse(cleanText);
    } catch (err) {
      console.error("Invalid JSON from Gemini:\n", cleanText);
      throw new Error("Gemini returned invalid JSON");
    }

  } catch (error) {
    console.error("Gemini Fetch Error:", error.message);
    throw new Error("Gemini API fetch failed");
  }
};