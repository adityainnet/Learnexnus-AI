/**
 * Builds the Gemini prompt for AI question generation.
 * Formats instructions to ensure valid, structured JSON output matching the front-end renderer.
 */
export function buildQuestionPrompt({
  topic,
  classLevel,
  examType,
  totalMarks,
  timeDuration,
  difficulty,
  sections,
  mcqCount,
  tfCount,
  shortCount,
  longCount,
}) {
  const sectionRequests = [];
  let sectionIndex = 1;

  if (sections.mcq) {
    const char = String.fromCharCode(64 + sectionIndex); // A, B, C, D...
    sectionRequests.push(`
    {
      "name": "SECTION ${char}",
      "title": "Multiple Choice Questions",
      "type": "mcq",
      "instructions": "Attempt all questions. Select the correct option.",
      "marksPerQuestion": 1,
      "questions": [
        {
          "number": 1,
          "question": "A clear multiple choice question about the topic",
          "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
          "answer": "A) option 1"
        }
      ]
    } (generate exactly ${mcqCount} questions in this section)`);
    sectionIndex++;
  }

  if (sections.tf) {
    const char = String.fromCharCode(64 + sectionIndex);
    sectionRequests.push(`
    {
      "name": "SECTION ${char}",
      "title": "True or False Questions",
      "type": "tf",
      "instructions": "State whether the following statements are True or False.",
      "marksPerQuestion": 1,
      "questions": [
        {
          "number": 1,
          "question": "A clear statement that is either true or false",
          "answer": "True"
        }
      ]
    } (generate exactly ${tfCount} questions in this section)`);
    sectionIndex++;
  }

  if (sections.short) {
    const char = String.fromCharCode(64 + sectionIndex);
    sectionRequests.push(`
    {
      "name": "SECTION ${char}",
      "title": "Short Answer Questions",
      "type": "short",
      "instructions": "Answer in 2-3 sentences.",
      "marksPerQuestion": 3,
      "questions": [
        {
          "number": 1,
          "question": "A conceptual short-answer question",
          "answer": "Suggested brief answer key/rubric."
        }
      ]
    } (generate exactly ${shortCount} questions in this section)`);
    sectionIndex++;
  }

  if (sections.long) {
    const char = String.fromCharCode(64 + sectionIndex);
    sectionRequests.push(`
    {
      "name": "SECTION ${char}",
      "title": "Long Answer Questions",
      "type": "long",
      "instructions": "Answer in detail (5-8 sentences).",
      "marksPerQuestion": 5,
      "questions": [
        {
          "number": 1,
          "question": "A comprehensive essay/problem-solving question",
          "answer": "Suggested detailed answer key/rubric guidelines."
        }
      ]
    } (generate exactly ${longCount} questions in this section)`);
    sectionIndex++;
  }

  return `You are an expert educational exam writer and academic question designer.
Generate an exam paper based on the following criteria:
- Topic/Subject: "${topic}"
- Class/Grade Level: "${classLevel || "General"}"
- Exam Type/Category: "${examType || "Exam"}"
- Total Marks: "${totalMarks || "100"}"
- Time Duration: "${timeDuration || "3 Hours"}"
- Difficulty: "${difficulty || "Medium"}"

CRITICAL JSON RULES:
- Output MUST be a valid, raw JSON object.
- DO NOT wrap the output in markdown code blocks (e.g. do NOT use \`\`\`json ... \`\`\`).
- Use double quotes for keys and string values. No trailing commas.
- Escape line breaks inside strings as \\n.

The JSON MUST conform exactly to the following schema:
{
  "examType": "${examType || "EXAM"}",
  "subject": "${topic}",
  "classLevel": "${classLevel || "General"}",
  "totalMarks": "${totalMarks || "100"}",
  "timeDuration": "${timeDuration || "3 Hours"}",
  "difficulty": "${difficulty || "Medium"}",
  "generalInstructions": [
    "Write your name and details clearly on the answer sheets.",
    "Attempt all sections as instructed.",
    "Write legibly and show steps where necessary."
  ],
  "sections": [
    // Include only the requested sections below.
    ${sectionRequests.join(",\n")}
  ]
}

Ensure all questions are high-yield, accurate, and completely aligned with the "${difficulty}" difficulty level. Do not output anything other than the raw JSON.`;
}