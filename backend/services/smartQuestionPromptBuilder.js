/**
 * Prompt builder for smart text extraction, topic analysis, and question generation.
 */

/**
 * Builds the prompt for analyzing raw extracted text to detect topic, concepts, difficulty, and quiz suggestions.
 */
export function buildTextAnalysisPrompt(text) {
  return `You are an expert academic curriculum analyst.
Analyze the following reference text and provide a structured analysis in JSON.

REFERENCE TEXT:
"${text.substring(0, 8000)}"

CRITICAL JSON RULES:
- Output MUST be a valid, raw JSON object.
- DO NOT wrap the output in markdown code blocks (no \`\`\`json ... \`\`\`).
- Return ONLY the raw JSON object.

REQUIRED SCHEMA FORMAT:
{
  "detectedTopic": "A concise main subject/topic name representing this text (e.g. Photosynthesis, Newton's Laws)",
  "concepts": [
    "List of 3-5 specific sub-concepts detected in the text"
  ],
  "estimatedDifficulty": "Easy | Medium | Hard",
  "suggestions": [
    "List of 3-4 specific areas or questions that would be ideal for testing based on the text contents"
  ]
}

Return ONLY the raw JSON.`;
}

/**
 * Builds the question generation prompt based on reference text.
 */
export function buildSmartQuestionPrompt({
  text,
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
    const char = String.fromCharCode(64 + sectionIndex);
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
          "question": "A multiple choice question directly based on the reference text",
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
      "instructions": "State whether the following statements are True or False based on the reference text.",
      "marksPerQuestion": 1,
      "questions": [
        {
          "number": 1,
          "question": "A clear statement from the reference text that is either true or false",
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
      "instructions": "Answer in 2-3 sentences based on the reference text.",
      "marksPerQuestion": 3,
      "questions": [
        {
          "number": 1,
          "question": "A conceptual short-answer question testing details in the text",
          "answer": "Suggested brief answer key based on the text."
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
      "instructions": "Answer in detail (5-8 sentences) explaining concepts from the text.",
      "marksPerQuestion": 5,
      "questions": [
        {
          "number": 1,
          "question": "A comprehensive analysis/essay question testing deep understanding of the text",
          "answer": "Detailed answer key/rubric according to the text contents."
        }
      ]
    } (generate exactly ${longCount} questions in this section)`);
    sectionIndex++;
  }

  return `You are an expert educational exam writer and academic question designer.
Generate an exam paper based on the following reference text/source note and criteria.

REFERENCE SOURCE TEXT:
"${text.substring(0, 8000)}"

CRITERIA:
- Topic/Subject: "${topic}"
- Class/Grade Level: "${classLevel || "General"}"
- Exam Type/Category: "${examType || "Exam"}"
- Total Marks: "${totalMarks || "100"}"
- Time Duration: "${timeDuration || "3 Hours"}"
- Difficulty: "${difficulty || "Medium"}"

CRITICAL RULES:
- All questions MUST be directly derivable from, or conceptually relevant to, the provided REFERENCE SOURCE TEXT. Do not invent unrelated topics.
- Output MUST be a valid, raw JSON object.
- DO NOT wrap the output in markdown code blocks (no \`\`\`json ... \`\`\`).
- Return ONLY the raw JSON object.

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
    "Answers must be based on the provided reference material."
  ],
  "sections": [
    ${sectionRequests.join(",\n")}
  ]
}

Ensure all questions are high-yield, accurate, and completely aligned with the "${difficulty}" difficulty level. Do not output anything other than the raw JSON.`;
}
