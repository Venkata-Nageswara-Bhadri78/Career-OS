/** Manual application pipeline. Matches backend `JobStatus`. */
export const JOB_STATUSES = Object.freeze([
  "APPLIED",
  "SHORTLISTED",
  "RECEIVED_CALL",
  "SCREENING_CALL",
  "INTERVIEWS",
  "FINAL_ROUND",
  "SELECTED",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "ON_HOLD",
  "CUSTOM",
]);

export const CUSTOM_STATUS_MAX_LENGTH = 100;

const JOB_STATUS_LABELS = Object.freeze({
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  RECEIVED_CALL: "Received call",
  SCREENING_CALL: "Screening call",
  INTERVIEWS: "Interviews",
  FINAL_ROUND: "Final round",
  SELECTED: "Selected",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  ON_HOLD: "On hold",
  CUSTOM: "Custom",
});

/** Distinct stage colors. Text stays readable on a light tint of the same color. */
export const JOB_STATUS_COLORS = Object.freeze({
  APPLIED: "#475569",
  SHORTLISTED: "#0284C7",
  RECEIVED_CALL: "#0891B2",
  SCREENING_CALL: "#4F46E5",
  INTERVIEWS: "#7C3AED",
  FINAL_ROUND: "#D97706",
  SELECTED: "#059669",
  OFFER: "#16A34A",
  ACCEPTED: "#15803D",
  REJECTED: "#DC2626",
  WITHDRAWN: "#78716C",
  ON_HOLD: "#CA8A04",
  CUSTOM: "#C9A227",
});

export const JOB_STATUS_OPTIONS = Object.freeze(
  JOB_STATUSES.map((value) => ({
    value,
    label: JOB_STATUS_LABELS[value],
    color: JOB_STATUS_COLORS[value],
  }))
);

/**
 * @param {unknown} status
 * @returns {string|null}
 */
export function getJobStatusColor(status) {
  const parsed = parseJobStatus(status);
  return parsed ? JOB_STATUS_COLORS[parsed] : null;
}

const STATUS_ALIASES = Object.freeze({
  SHOTLISTED: "SHORTLISTED",
});

/**
 * Accepts enum names, spaced labels, hyphens, and the known typo SHOTLISTED.
 * Unknown values are rejected rather than displayed raw.
 * @param {unknown} value
 * @returns {string|null}
 */
export function parseJobStatus(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw.toUpperCase().replace(/[\s-]+/g, "_");
  const name = STATUS_ALIASES[normalized] || normalized;
  return JOB_STATUSES.includes(name) ? name : null;
}

/**
 * @param {unknown} status
 * @param {unknown} [customStatus]
 */
export function formatJobStatus(status, customStatus) {
  const parsed = parseJobStatus(status);
  if (!parsed) return "—";
  if (parsed === "CUSTOM") {
    const label = typeof customStatus === "string" ? customStatus.trim().slice(0, 100) : "";
    return label || JOB_STATUS_LABELS.CUSTOM;
  }
  return JOB_STATUS_LABELS[parsed] || "—";
}

/**
 * @param {unknown} value
 * @returns {number|null} Integer 0–100, or null when the value is missing or invalid.
 */
export function parseResumeToJobScore(value) {
  if (value == null || value === "") return null;
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(score) || score < 0 || score > 100) return null;
  return score;
}

/**
 * @param {unknown} value
 */
export function formatResumeToJobScore(value) {
  const score = parseResumeToJobScore(value);
  return score == null ? "—" : String(score);
}
