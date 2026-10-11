export const JOB_DRAFTS_PAGE_SIZE = 10;

export const JOB_DRAFT_SORT_OPTIONS = Object.freeze([
  { value: "updatedAt", label: "Last updated" },
  { value: "createdAt", label: "Date added" },
  { value: "title", label: "Title" },
  { value: "company", label: "Company" },
  { value: "sourceUrl", label: "Source URL" },
  { value: "resumeToJobScore", label: "Score" },
]);

export const JOB_DRAFT_SORT_FIELDS = Object.freeze(JOB_DRAFT_SORT_OPTIONS.map((option) => option.value));

export const JOB_DRAFT_FAILURE_LABELS = Object.freeze({
  VALIDATION: "Missing or invalid fields",
  PERSISTENCE: "Could not store the job",
  EXTERNAL: "Could not structure the posting",
  UNEXPECTED: "Could not save the job",
});
