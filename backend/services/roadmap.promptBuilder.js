/**
 * Builds the main Gemini prompt for generating a structured, visual career or learning roadmap.
 */
export function buildRoadmapPrompt({ type, query, level = "Beginner" }) {
  const isCareerGuidance = type === "career";

  return `You are an expert career counselor, educational strategist, and technical curriculum designer.
Your goal is to generate a comprehensive, visually structure-ready roadmap for:
- Query/Field/Stream: "${query}"
- Roadmap Type: "${isCareerGuidance ? "Career Guidance & Stream Selection" : "Skill Learning Path"}"
- Target User Skill Level: "${level}"

CRITICAL JSON RULES (FAILURE TO FOLLOW CRASHES THE SYSTEM):
- Output MUST be a valid, raw JSON object.
- DO NOT wrap the output in markdown code blocks (no \`\`\`json ... \`\`\`).
- Use only double quotes for keys and string values.
- No trailing commas.
- Escape line breaks inside strings using \\n.
- Return ONLY the raw JSON object.

REQUIRED STRUCTURE FORMAT:
{
  "title": "A clear, descriptive title for the roadmap",
  "description": "A high-level summary of this career path or learning journey",
  "estimatedTime": "Suggested total timeline (e.g. 6-9 months, 2 years)",
  "careerOpportunities": [
    "List of 3-5 actual job roles or future streams this leads to"
  ],
  "milestones": [
    {
      "id": "m1",
      "title": "Milestone/Phase 1 Title",
      "description": "What will be learned/achieved in this phase",
      "duration": "Estimated time (e.g. 2-3 weeks)",
      "topics": [
        { "name": "Topic name (e.g. Semantic HTML)", "importance": "critical | high | medium" }
      ],
      "resources": [
        { "title": "Resource title (e.g. MDN Web Docs)", "url": "Placeholder URL or actual documentation link" }
      ],
      "projects": [
        { "title": "Build a ... project", "description": "Quick description of a project to practice this phase" }
      ]
    }
  ],
  "connections": [
    { "from": "m1", "to": "m2", "label": "e.g. Next Step" }
  ],
  "mermaid": "graph TD\\n  m1[Phase 1 Title] --> m2[Phase 2 Title]\\n  click m1 href \\\"#m1\\\"\\n  click m2 href \\\"#m2\\\""
}

DESIGN RULES:
- Generate between 4 to 8 milestones sequentially mapping the progression.
- Maintain a logical flow from beginner/foundational concepts up to advanced/professional grade skills.
- The "mermaid" field MUST contain valid Mermaid.js flowchart code starting with "graph TD" or "graph LR".
- Make sure to use nodes labeled corresponding to milestone IDs (e.g., m1, m2, etc.).

Return ONLY the raw JSON.`;
}

/**
 * Builds a simplified prompt used as a fallback if the main prompt fails.
 */
export function buildSimplifiedRoadmapPrompt({ type, query, level = "Beginner" }) {
  return `Create a basic learning roadmap for "${query}" starting at "${level}" level. 
Output ONLY valid raw JSON with this exact layout structure:
{
  "title": "Roadmap to ${query}",
  "description": "Simplified guide to learning ${query}",
  "estimatedTime": "3-6 months",
  "careerOpportunities": ["Developer", "Analyst"],
  "milestones": [
    {
      "id": "m1",
      "title": "Phase 1: Foundations",
      "description": "Learn the basics of ${query}",
      "duration": "4 weeks",
      "topics": [{ "name": "Syntax & Basics", "importance": "critical" }],
      "resources": [{ "title": "Google Search", "url": "https://google.com" }],
      "projects": [{ "title": "Basic Hello World project", "description": "Create a starter app" }]
    },
    {
      "id": "m2",
      "title": "Phase 2: Core Concepts",
      "description": "Dive deeper into core elements",
      "duration": "6 weeks",
      "topics": [{ "name": "Advanced concepts", "importance": "high" }],
      "resources": [{ "title": "Documentation", "url": "https://google.com" }],
      "projects": [{ "title": "Intermediate application", "description": "Build something useful" }]
    }
  ],
  "connections": [
    { "from": "m1", "to": "m2" }
  ],
  "mermaid": "graph TD\\n  m1[Foundations] --> m2[Core Concepts]"
}

Return ONLY the raw JSON.`;
}
