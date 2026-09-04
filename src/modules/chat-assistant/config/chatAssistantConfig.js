export const CHAT_ASSISTANT_LIMITS = Object.freeze({
  PROMPT_MAX: 8000,
  PAGE_SIZE: 50,
  PAGE_SIZE_MIN: 1,
  PAGE_SIZE_MAX: 50,
  MODEL_CONTEXT_TURNS: 16,
});

/** Backend AI timeout is ~60s; allow headroom for network. */
export const SEND_TIMEOUT_MS = 70_000;

export const HISTORY_TIMEOUT_MS = 30_000;

export const RETRY_AFTER_FALLBACK_SECONDS = 60;
export const RETRY_AFTER_MAX_SECONDS = 300;

export const DRAFT_STORAGE_PREFIX = "career-os:chat-draft:";

export const COMING_SOON_MESSAGE = "Useful feature - backend development under process";

export const STARTER_PROMPTS = Object.freeze([
  {
    id: "interview",
    label: "Interview questions",
    prompt: "Which interview questions should I prepare for first for this role, and why?",
  },
  {
    id: "gaps",
    label: "Skill gaps",
    prompt: "Compare my likely background to this job and list the most important skill gaps to close.",
  },
  {
    id: "resume",
    label: "Resume bullets",
    prompt: "Draft 5 resume bullet points tailored to this job description.",
  },
  {
    id: "cover",
    label: "Cover letter",
    prompt: "Draft a concise cover letter for this role. Use a Subject line and a professional greeting.",
  },
  {
    id: "outreach",
    label: "Outreach email",
    prompt: "Draft a short cold outreach email to a hiring manager about this role. Include a Subject line.",
  },
  {
    id: "salary",
    label: "Salary prep",
    prompt: "How should I prepare to discuss compensation for this role based on the posting?",
  },
]);

export const FOLLOW_UP_PROMPTS = Object.freeze([
  { id: "explain", label: "Explain this", prompt: "Explain the previous answer in simpler terms." },
  { id: "simplify", label: "Simplify", prompt: "Rewrite the previous answer more concisely." },
  { id: "continue", label: "Continue", prompt: "Continue from the previous answer with the next most useful details." },
  { id: "examples", label: "Give examples", prompt: "Give concrete examples that illustrate the previous answer." },
]);

export const SELECTION_ACTIONS = Object.freeze([
  { id: "explain", label: "Explain", prefix: "Explain this excerpt:\n\n" },
  { id: "rewrite", label: "Rewrite", prefix: "Rewrite this excerpt more clearly:\n\n" },
  { id: "summarize", label: "Summarize", prefix: "Summarize this excerpt:\n\n" },
  { id: "translate", label: "Translate", prefix: "Translate this excerpt into plain English:\n\n" },
  { id: "improve", label: "Improve", prefix: "Improve this excerpt for a job application:\n\n" },
]);

export const LANGUAGE_EXTENSIONS = Object.freeze({
  javascript: "js",
  js: "js",
  jsx: "jsx",
  typescript: "ts",
  ts: "ts",
  tsx: "tsx",
  python: "py",
  py: "py",
  java: "java",
  sql: "sql",
  json: "json",
  bash: "sh",
  sh: "sh",
  shell: "sh",
  html: "html",
  css: "css",
  yaml: "yml",
  yml: "yml",
  xml: "xml",
  markdown: "md",
  md: "md",
  graphql: "graphql",
  go: "go",
  rust: "rs",
  kotlin: "kt",
  swift: "swift",
});

export const COLLAPSE_RESPONSE_CHARS = 4000;
