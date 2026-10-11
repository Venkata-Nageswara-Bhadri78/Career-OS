import { parseResumeToJobScore } from "./jobStatus";

/**
 * Inclusive ranges. Ring colors are far enough apart to read at a small size:
 * green feels strong, amber feels decent, yellow feels partial, red feels poor.
 * `text` is a darker shade of the same hue so the number stays readable.
 */
export const MATCH_SCORE_BANDS = Object.freeze([
  { min: 85, max: 100, color: "#16A34A", text: "#15803D", label: "Excellent match" },
  { min: 70, max: 84, color: "#F59E0B", text: "#B45309", label: "Moderate-to-strong match" },
  { min: 60, max: 69, color: "#FACC15", text: "#A16207", label: "Partial match" },
  { min: 0, max: 59, color: "#EF4444", text: "#DC2626", label: "Poor match" },
]);

/**
 * @param {unknown} value
 * @returns {{ score: number, color: string, label: string } | null}
 */
export function getResumeMatchScoreBand(value) {
  const score = parseResumeToJobScore(value);
  if (score == null) return null;
  const band = MATCH_SCORE_BANDS.find((item) => score >= item.min && score <= item.max);
  if (!band) return null;
  return { score, color: band.color, text: band.text, label: band.label };
}
