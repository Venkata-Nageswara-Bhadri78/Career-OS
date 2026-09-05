export const AI_LIMITS = Object.freeze({
  PROMPT_MAX: 8000,
  PASTE_MAX: 16000,
  TEMPERATURE_MIN: 0,
  TEMPERATURE_MAX: 2,
});

/** Backend provider timeout is ~60s; allow headroom for network. */
export const CHAT_TIMEOUT_MS = 70_000;
export const METADATA_TIMEOUT_MS = 30_000;

export const RESUME_POLL_INTERVAL_MS = 5_000;
export const RATE_LIMIT_FALLBACK_SECONDS = 60;
export const RATE_LIMIT_MAX_SECONDS = 300;
export const BUSY_WAIT_SECONDS = 30;

export const SAVED_JOBS_PAGE_SIZE = 50;

export const COMING_SOON_MESSAGE = "Useful feature - backend development under process";

export const AI_MODES = Object.freeze({
  GENERAL_CHAT: "GENERAL_CHAT",
  MATCH_ANALYSIS: "MATCH_ANALYSIS",
  RESUME_REVIEW: "RESUME_REVIEW",
  COVER_LETTER: "COVER_LETTER",
  COLD_EMAIL: "COLD_EMAIL",
  INTERVIEW_PREP: "INTERVIEW_PREP",
});

export const DEFAULT_AI_MODE = AI_MODES.GENERAL_CHAT;

export const AI_MODE_OPTIONS = Object.freeze([
  {
    id: AI_MODES.GENERAL_CHAT,
    label: "General",
    shortLabel: "General",
    description: "Career guidance, interview strategy, and open questions.",
    placeholder: "Ask about your search, a role, or how to present your experience…",
  },
  {
    id: AI_MODES.MATCH_ANALYSIS,
    label: "Match analysis",
    shortLabel: "Match",
    description: "Skill fit, gaps, and interview risk against a job description.",
    placeholder: "Ask for a match score, missing skills, or seniority fit…",
  },
  {
    id: AI_MODES.RESUME_REVIEW,
    label: "Resume review",
    shortLabel: "Resume",
    description: "Critique and rewrite bullets with measurable impact.",
    placeholder: "Ask to review or rewrite resume bullets for this role…",
  },
  {
    id: AI_MODES.COVER_LETTER,
    label: "Cover letter",
    shortLabel: "Cover letter",
    description: "A short, tailored letter aimed at the posting’s pain points.",
    placeholder: "Ask to draft a cover letter for this company and role…",
  },
  {
    id: AI_MODES.COLD_EMAIL,
    label: "Cold email",
    shortLabel: "Cold email",
    description: "Short outreach notes with a clear subject line.",
    placeholder: "Ask for a recruiter or hiring-manager outreach email…",
  },
  {
    id: AI_MODES.INTERVIEW_PREP,
    label: "Interview prep",
    shortLabel: "Interview",
    description: "Likely questions with concise STAR-style answers.",
    placeholder: "Ask for likely technical or behavioral questions…",
  },
]);

export const MODE_SUGGESTIONS = Object.freeze({
  [AI_MODES.GENERAL_CHAT]: [
    { id: "align", label: "Background fit", prompt: "How does my background align with this kind of role, and what should I emphasize first?" },
    { id: "skills", label: "High-impact skills", prompt: "What are the top 3 high-impact skills I should emphasize in applications right now?" },
    { id: "process", label: "Interview process", prompt: "Give me practical advice for navigating a technical interview process." },
    { id: "ask", label: "Questions to ask", prompt: "What questions should I ask an engineering manager in a first-round conversation?" },
  ],
  [AI_MODES.MATCH_ANALYSIS]: [
    { id: "score", label: "Match score", prompt: "Estimate my match for this job and summarize skill alignment in a short table." },
    { id: "gaps", label: "Skill gaps", prompt: "What critical skill gaps or missing keywords should I address before applying?" },
    { id: "seniority", label: "Seniority", prompt: "Evaluate my experience against this role’s seniority requirements." },
    { id: "risks", label: "Interview risks", prompt: "What are the biggest interview risk factors for this position?" },
  ],
  [AI_MODES.RESUME_REVIEW]: [
    { id: "xyz", label: "X-Y-Z critique", prompt: "Critique my resume bullet points using the X-Y-Z formula and rewrite the weakest three." },
    { id: "rewrite", label: "Rewrite bullets", prompt: "Rewrite 3 project bullet points tailored specifically to this role." },
    { id: "metrics", label: "Add metrics", prompt: "Identify missing metrics and suggest quantified replacements." },
    { id: "summary", label: "Summary", prompt: "How can I optimize my technical summary for this job?" },
  ],
  [AI_MODES.COVER_LETTER]: [
    { id: "three", label: "3 paragraphs", prompt: "Generate a 3-paragraph tailored cover letter for this position. Include a Subject line." },
    { id: "concise", label: "Concise letter", prompt: "Draft a concise cover letter that emphasizes delivery and relevant technical wins. Include a Subject line." },
    { id: "exec", label: "Executive summary", prompt: "Create a short executive-style cover note highlighting leadership and delivery. Include a Subject line." },
  ],
  [AI_MODES.COLD_EMAIL]: [
    { id: "em", label: "Engineering manager", prompt: "Write a 120-word cold outreach email to the Engineering Manager. Include a Subject line." },
    { id: "recruiter", label: "Recruiter", prompt: "Generate 2 short email variations for a technical recruiter. Include a Subject line for each." },
    { id: "followup", label: "Follow-up", prompt: "Draft a follow-up email after applying on the company careers site. Include a Subject line." },
  ],
  [AI_MODES.INTERVIEW_PREP]: [
    { id: "tech", label: "Technical Qs", prompt: "Predict the top 5 technical and architecture questions for this job." },
    { id: "star", label: "STAR answers", prompt: "Give me 3 behavioral questions with model STAR answers based on my background." },
    { id: "design", label: "System design", prompt: "Provide a system design breakdown that is realistic for this role." },
    { id: "practice", label: "Practice list", prompt: "What live-coding concepts should I practice before the interview loop?" },
  ],
});

export function getModeConfig(mode) {
  return AI_MODE_OPTIONS.find((item) => item.id === mode) || AI_MODE_OPTIONS[0];
}

export function getSuggestionsForMode(mode) {
  return MODE_SUGGESTIONS[mode] || MODE_SUGGESTIONS[AI_MODES.GENERAL_CHAT];
}

export function isAiMode(value) {
  return Object.prototype.hasOwnProperty.call(AI_MODES, value);
}
