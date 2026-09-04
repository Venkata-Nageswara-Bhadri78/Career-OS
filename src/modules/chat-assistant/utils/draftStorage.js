import { DRAFT_STORAGE_PREFIX } from "../config/chatAssistantConfig";

function storageKey(jobId) {
  return `${DRAFT_STORAGE_PREFIX}${jobId}`;
}

export function readDraft(jobId) {
  if (!jobId || typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(storageKey(jobId)) || "";
  } catch {
    return "";
  }
}

export function writeDraft(jobId, text) {
  if (!jobId || typeof window === "undefined") return;
  try {
    const value = String(text ?? "");
    if (!value) sessionStorage.removeItem(storageKey(jobId));
    else sessionStorage.setItem(storageKey(jobId), value);
  } catch {
    /* private mode */
  }
}

export function clearDraft(jobId) {
  if (!jobId || typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey(jobId));
  } catch {
    /* private mode */
  }
}
