import { useRef, useState } from "react";
import { USER_LIMITS } from "../../config/userConfig";
import { formatFileSize } from "../../utils/formatters";
import ConfirmPopover from "../common/ConfirmPopover";
import { IconCheck, IconCrown, IconDocument, IconDownload } from "../common/UserIcons";
import EmptyState from "../sub-components/EmptyState";
import SectionAddButton from "../sub-components/SectionAddButton";
import SectionHeader from "../sub-components/SectionHeader";
import Spinner from "../../../../common/components/loaders/Spinner";

function ParseStatusTag({ status, message }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Parsed
        <IconCheck className="h-3 w-3" />
      </span>
    );
  }
  if (status === "pending" || status === "rateLimited") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted" title={message || undefined}>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        Processing
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger" title={message || undefined}>
        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
        Failed
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted" title={message || undefined}>
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        Unavailable
      </span>
    );
  }
  return null;
}

export default function ResumesSection({
  resumes,
  parse,
  parseById = {},
  busy,
  onUpload,
  onDelete,
  onSetPrimary,
  onDownload,
  onPreview,
}) {
  const inputRef = useRef(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const openDeleteConfirm = (event, resume) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setOpenMenuId(null);
    setPendingDelete({
      resume,
      top: rect.bottom + 6,
      left: rect.right - 240,
    });
  };
  const atCap = resumes.length >= USER_LIMITS.RESUME_CAP;
  const uploading = busy === "upload";

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await onUpload(file);
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
      <SectionHeader
        icon={<IconDocument className="h-5 w-5" />}
        title="Resumes"
        meta={`${resumes.length}/${USER_LIMITS.RESUME_CAP}`}
        action={
          <SectionAddButton
            label="Upload new resume"
            variant="solid"
            busy={uploading}
            disabled={atCap || uploading}
            onClick={() => inputRef.current?.click()}
          />
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={handleFile}
        disabled={atCap || uploading}
      />

      {resumes.length === 0 ? (
        <EmptyState
          compact
          icon={<IconDocument className="h-8 w-8" />}
          message="No resumes uploaded yet. Use Upload new resume for a PDF up to 5MB."
          actionLabel={atCap ? null : "+ Upload resume"}
          onAction={() => inputRef.current?.click()}
          disabled={uploading}
        />
      ) : (
        <div className="user-hide-scrollbar flex gap-4 overflow-x-auto overflow-y-visible pt-1">
          {resumes.map((resume) => {
            const isPrimary = resume.highPriority;
            const deleting = busy === `resume-delete-${resume.id}`;
            const promoting = busy === `resume-primary-${resume.id}`;
            const cardParse = parseById[resume.id] || (isPrimary ? parse : { status: "ready" });
            return (
              <article
                key={resume.id}
                className={`relative flex h-44 w-64 shrink-0 flex-col justify-between overflow-visible rounded-2xl border p-4 ${
                  isPrimary ? "border-accent bg-accent/5 shadow-sm" : "border-line bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-field text-ink">
                    <IconDocument className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isPrimary ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                        <IconCrown />
                        Primary
                      </span>
                    ) : null}
                  <div className="relative">
                    <button
                      type="button"
                      className="rounded-lg px-2 py-1 text-lg leading-none text-muted hover:bg-field hover:text-ink"
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === resume.id}
                      aria-label={`Resume actions for ${resume.originalFilename}`}
                      onClick={() => setOpenMenuId((current) => (current === resume.id ? null : resume.id))}
                    >
                      ···
                    </button>
                    {openMenuId === resume.id ? (
                      <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-line bg-white py-1 shadow-xl" role="menu">
                        <button type="button" className="block w-full px-3 py-2 text-left text-xs font-medium hover:bg-field" onClick={() => { setOpenMenuId(null); onPreview(resume.id); }}>
                          Preview
                        </button>
                        <button type="button" className="block w-full px-3 py-2 text-left text-xs font-medium hover:bg-field" onClick={() => { setOpenMenuId(null); onDownload(resume.id); }}>
                          Download
                        </button>
                        {!isPrimary ? (
                          <button type="button" className="block w-full px-3 py-2 text-left text-xs font-medium hover:bg-field" disabled={promoting} onClick={() => { setOpenMenuId(null); onSetPrimary(resume.id); }}>
                            Set as primary
                          </button>
                        ) : null}
                        <button type="button" className="block w-full px-3 py-2 text-left text-xs font-medium text-danger hover:bg-danger/5" onClick={(event) => openDeleteConfirm(event, resume)}>
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                  </div>
                </div>

                <div>
                  <h3 className="truncate text-sm font-bold text-ink" title={resume.originalFilename}>
                    {resume.originalFilename}
                  </h3>
                  <p className="mt-1 text-xs text-muted">{formatFileSize(resume.fileSize)}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <ParseStatusTag status={cardParse.status} message={cardParse.message} />
                    <button
                      type="button"
                      onClick={() => onDownload(resume.id)}
                      className="rounded-lg p-1.5 text-muted hover:bg-field hover:text-ink"
                      aria-label={`Download ${resume.originalFilename}`}
                    >
                      <IconDownload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {deleting ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
                    <Spinner className="h-5 w-5 text-ink" />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {openMenuId ? (
        <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close resume menu" onClick={() => setOpenMenuId(null)} />
      ) : null}

      <ConfirmPopover
        open={Boolean(pendingDelete)}
        anchor={pendingDelete}
        title="Delete this resume?"
        message="This permanently removes the file."
        confirmLabel="Delete"
        busy={pendingDelete ? busy === `resume-delete-${pendingDelete.resume.id}` : false}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          const id = pendingDelete?.resume?.id;
          const ok = await onDelete(id);
          if (ok) setPendingDelete(null);
        }}
      />
    </section>
  );
}
