const CUSTOM_PROMPT_BASE_PATH = "/api/v1/custom-prompts";

export const CUSTOM_PROMPT_ENDPOINTS = Object.freeze({
  LIST: CUSTOM_PROMPT_BASE_PATH,
  BY_ID: (id) => `${CUSTOM_PROMPT_BASE_PATH}/${id}`,
});

export default CUSTOM_PROMPT_ENDPOINTS;
