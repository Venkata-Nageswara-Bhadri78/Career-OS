export const CUSTOM_PROMPT_LIMITS = Object.freeze({
  TITLE_MAX: 255,
  PROMPT_MAX: 8000,
});

export const CUSTOM_PROMPT_TIMEOUT_MS = 30_000;

export const CUSTOM_PROMPT_COPY = Object.freeze({
  CREATED: "Custom prompt created successfully.",
  UPDATED: "Custom prompt updated successfully.",
  DELETED: "Custom prompt deleted successfully.",
  NOT_FOUND: "Custom prompt not found.",
  TITLE_BLANK: "Title cannot be blank.",
  TITLE_MAX: "Title cannot exceed 255 characters.",
  PROMPT_BLANK: "Prompt cannot be blank.",
  PROMPT_MAX: "Prompt cannot exceed 8000 characters.",
});
