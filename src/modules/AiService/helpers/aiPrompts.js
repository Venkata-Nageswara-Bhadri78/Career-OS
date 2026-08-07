import { AI_MODES } from "./aiModes";

export const MODE_SUGGESTIONS = {
  [AI_MODES.GENERAL_CHAT]: [
    "How does my background align with this role?",
    "What are the top 3 high-impact skills I should emphasize?",
    "Give me advice on navigating the technical interview process.",
    "What questions should I ask the engineering manager?",
  ],
  [AI_MODES.MATCH_ANALYSIS]: [
    "Calculate my match percentage and skill alignment table.",
    "What critical skill gaps or missing keywords should I address?",
    "Evaluate my experience against this role's seniority requirements.",
    "What are the biggest interview risk factors for this position?",
  ],
  [AI_MODES.RESUME_REVIEW]: [
    "Critique my resume bullet points using Google's X-Y-Z formula.",
    "Rewrite 3 project bullet points tailored specifically for this role.",
    "Identify missing metrics and quantifiable achievements.",
    "How can I optimize my technical summary for this job?",
  ],
  [AI_MODES.COVER_LETTER]: [
    "Generate a 3-paragraph tailored cover letter for this position.",
    "Draft a concise cover letter emphasizing backend architecture wins.",
    "Create an executive summary highlighting leadership and delivery.",
  ],
  [AI_MODES.COLD_EMAIL]: [
    "Write a 120-word cold outreach email to the Engineering Manager.",
    "Generate 2 high-conversion email variations for Technical Recruiters.",
    "Draft a follow-up email after applying on the company careers site.",
  ],
  [AI_MODES.INTERVIEW_PREP]: [
    "Predict top 5 technical and architecture questions for this job.",
    "Give me 3 behavioral questions with model STAR answers.",
    "Provide a system design breakdown expected for this role.",
    "What live coding concepts should I practice before the loop?",
  ],
};

export function getSuggestionsForMode(mode) {
  return MODE_SUGGESTIONS[mode] || MODE_SUGGESTIONS[AI_MODES.GENERAL_CHAT];
}
