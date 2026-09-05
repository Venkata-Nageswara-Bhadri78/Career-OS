import { useEffect, useRef, useState } from "react";
import { USER_LIMITS } from "../../config/userConfig";
import { copyToClipboard, hostnameFromHref, toSafeHref } from "../../utils/formatters";
import { IconCheck, IconCopy, IconGlobe, IconMail, IconPencil, IconPhone } from "../common/UserIcons";
import { fieldClassName, textareaClassName } from "../common/FormField";
import InlineEditor from "../common/InlineEditor";
import CompletenessRing from "../sub-components/CompletenessRing";
import DefaultAvatar from "../sub-components/DefaultAvatar";

function findPhone(profile) {
  const extras = profile?.additionalInformation || [];
  const match = extras.find((item) => /phone|mobile|tel/i.test(item.type || "") && (item.description || item.link));
  if (!match) return null;
  return (match.description || match.link || "").trim() || null;
}

function CopyButton({ label, copied, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 rounded-md p-0.5 ${copied ? "text-ink" : "text-muted hover:bg-field hover:text-ink"}`}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
    >
      {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export default function ProfileOverviewCard({ profile, completeness, busy = false, onSave }) {
  const [copiedKey, setCopiedKey] = useState("");
  const copiedTimerRef = useRef(null);
  const [editing, setEditing] = useState(null);
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [localError, setLocalError] = useState("");

  const email = profile?.email || "";
  const phone = findPhone(profile);
  const website = (profile?.profileLinks || []).map((item) => toSafeHref(item.url)).find(Boolean);
  const siteLabel = website ? hostnameFromHref(website) || "Website" : "";

  useEffect(() => () => {
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
  }, []);

  const copyValue = async (key, value) => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopiedKey(key);
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = window.setTimeout(() => setCopiedKey(""), 1600);
  };

  const startEdit = (field) => {
    setHeadline(profile?.headline || "");
    setSummary(profile?.summary || "");
    setLocalError("");
    setEditing(field);
  };

  const cancelEdit = () => {
    if (busy) return;
    setEditing(null);
    setLocalError("");
  };

  const persist = async (event) => {
    event.preventDefault();
    if (headline.length > USER_LIMITS.HEADLINE_MAX) {
      setLocalError("Headline is too long.");
      return;
    }
    if (summary.length > USER_LIMITS.SUMMARY_MAX) {
      setLocalError("Summary is too long.");
      return;
    }
    setLocalError("");
    const ok = await onSave({
      headline,
      summary,
      technicalSkills: profile?.technicalSkills || "",
    });
    if (ok) setEditing(null);
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <CompletenessRing percentage={completeness} size="md">
          <DefaultAvatar />
        </CompletenessRing>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words font-bold text-ink [overflow-wrap:anywhere]">
                {profile?.fullName || "Your profile"}
              </h2>
              <p className="mt-1 text-sm text-muted">{completeness}% complete</p>
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-ink/80">
            <li className="flex items-center gap-2.5">
              <IconMail className="h-4 w-4 shrink-0 text-muted" />
              {email ? (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{email}</span>
                  <CopyButton label="email" copied={copiedKey === "email"} onClick={() => copyValue("email", email)} />
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </li>
            {phone ? (
              <li className="flex items-center gap-2.5">
                <IconPhone className="h-4 w-4 shrink-0 text-muted" />
                <span className="inline-flex min-w-0 items-center gap-1">
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{phone}</span>
                  <CopyButton label="phone number" copied={copiedKey === "phone"} onClick={() => copyValue("phone", phone)} />
                </span>
              </li>
            ) : null}
            <li className="flex items-center gap-2.5">
              <IconGlobe className="h-4 w-4 shrink-0 text-muted" />
              {website ? (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="truncate font-medium text-ink underline decoration-accent/70 underline-offset-2 hover:text-accent"
                    title={siteLabel}
                  >
                    {siteLabel}
                  </a>
                  <CopyButton label="portfolio link" copied={copiedKey === "website"} onClick={() => copyValue("website", website)} />
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        {editing === "headline" ? (
          <InlineEditor onSubmit={persist} onCancel={cancelEdit} busy={busy} error={localError}>
            <label htmlFor="inline-headline" className="sr-only">
              Headline
            </label>
            <input
              id="inline-headline"
              autoFocus
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              maxLength={USER_LIMITS.HEADLINE_MAX}
              className={`${fieldClassName} font-bold`}
              placeholder="Add your headline..."
            />
          </InlineEditor>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <h3 className={`font-bold ${profile?.headline ? "text-ink" : "text-muted"}`}>
              {profile?.headline || "Add your headline..."}
            </h3>
            <button
              type="button"
              onClick={() => startEdit("headline")}
              className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-field hover:text-ink"
              aria-label="Edit headline"
            >
              <IconPencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {!profile?.headline && editing !== "headline" ? <p className="sr-only">Headline is empty</p> : null}

        <div className="mt-5">
          {editing === "summary" ? (
            <InlineEditor onSubmit={persist} onCancel={cancelEdit} busy={busy} error={localError}>
              <label htmlFor="inline-summary" className="sr-only">
                Professional summary
              </label>
              <textarea
                id="inline-summary"
                autoFocus
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                maxLength={USER_LIMITS.SUMMARY_MAX}
                rows={4}
                className={textareaClassName}
                placeholder="Add a professional summary about yourself..."
              />
            </InlineEditor>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <p className={`min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere] ${profile?.summary ? "text-ink/80" : "text-muted"}`}>
                {profile?.summary || "Add a professional summary about yourself..."}
              </p>
              <button
                type="button"
                onClick={() => startEdit("summary")}
                className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-field hover:text-ink"
                aria-label="Edit professional summary"
              >
                <IconPencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
