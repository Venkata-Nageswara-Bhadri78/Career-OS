/**
 * Backend Supported Situational AI Modes (AiMode enum)
 */
export const AI_MODES = Object.freeze({
  GENERAL_CHAT: "GENERAL_CHAT",
  MATCH_ANALYSIS: "MATCH_ANALYSIS",
  RESUME_REVIEW: "RESUME_REVIEW",
  COVER_LETTER: "COVER_LETTER",
  COLD_EMAIL: "COLD_EMAIL",
  INTERVIEW_PREP: "INTERVIEW_PREP",
});

export const AI_MODE_CONFIG = Object.freeze({
  [AI_MODES.GENERAL_CHAT]: {
    id: AI_MODES.GENERAL_CHAT,
    label: "General Career Q&A",
    shortLabel: "General Chat",
    badge: "Career Q&A",
    description: "Open-ended career guidance, technical engineering discussion, and resume strategy.",
    placeholder: "Ask anything about this role, tech stack, or career advice...",
    icon: "chat",
  },
  [AI_MODES.MATCH_ANALYSIS]: {
    id: AI_MODES.MATCH_ANALYSIS,
    label: "Job Match Analysis",
    shortLabel: "Match Analysis",
    badge: "Score & Gaps",
    description: "Calculates match percentage (0–100%), skill alignment table, missing requirements & risk factors.",
    placeholder: "Ask to analyze my match score, missing skills, and interview risks for this job...",
    icon: "chart",
  },
  [AI_MODES.RESUME_REVIEW]: {
    id: AI_MODES.RESUME_REVIEW,
    label: "Resume Review (X-Y-Z)",
    shortLabel: "Resume Review",
    badge: "X-Y-Z Formula",
    description: "Rigorous critique of bullet points using Google's X-Y-Z formula to amplify measurable impact.",
    placeholder: "Ask to review and rewrite my resume bullet points for this position...",
    icon: "document",
  },
  [AI_MODES.COVER_LETTER]: {
    id: AI_MODES.COVER_LETTER,
    label: "Cover Letter Generator",
    shortLabel: "Cover Letter",
    badge: "Tailored Letter",
    description: "High-impact 3-paragraph tailored cover letter emphasizing achievements solving the job's pain points.",
    placeholder: "Ask to draft a persuasive cover letter tailored to this role and company...",
    icon: "mail",
  },
  [AI_MODES.COLD_EMAIL]: {
    id: AI_MODES.COLD_EMAIL,
    label: "Cold Outreach Email",
    shortLabel: "Cold Email",
    badge: "Recruiter Email",
    description: "Generates 2 variations of short (<150 words) networking emails with high-open subject lines.",
    placeholder: "Ask to generate cold outreach emails for hiring managers or recruiters...",
    icon: "send",
  },
  [AI_MODES.INTERVIEW_PREP]: {
    id: AI_MODES.INTERVIEW_PREP,
    label: "Interview Preparation",
    shortLabel: "Interview Prep",
    badge: "STAR Questions",
    description: "Predicts top technical and behavioral interview questions with model STAR answers.",
    placeholder: "Ask for predicted technical questions, system design challenges, or STAR answers...",
    icon: "target",
  },
});

export const DEFAULT_AI_MODE = AI_MODES.GENERAL_CHAT;

export function getModeConfig(modeKey) {
  return AI_MODE_CONFIG[modeKey] || AI_MODE_CONFIG[DEFAULT_AI_MODE];
}
