import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Spinner from "../../../../common/components/loaders/Spinner";
import {
  CUSTOM_STATUS_MAX_LENGTH,
  JOB_STATUS_OPTIONS,
  formatJobStatus,
  getJobStatusColor,
  parseJobStatus,
} from "../../config/jobStatus";

const MENU_GAP = 4;
const VIEWPORT_PAD = 8;

function placeFloatingPanel(anchor, panel, estimatedHeight) {
  const rect = anchor.getBoundingClientRect();
  const height = panel?.offsetHeight || estimatedHeight;
  const width = Math.max(panel?.offsetWidth || estimatedHeight, rect.width, 188);
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < height + MENU_GAP && rect.top > spaceBelow;
  let top = openUp ? rect.top - height - MENU_GAP : rect.bottom + MENU_GAP;
  top = Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - height - VIEWPORT_PAD));
  let left = rect.left;
  left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));
  return { top, left, width };
}

export default function JobStatusField({ job, onSave }) {
  const menuId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentStatus = parseJobStatus(job?.jobStatus);
  const currentLabel = formatJobStatus(job?.jobStatus, job?.customStatus);
  const currentColor = getJobStatusColor(job?.jobStatus);

  useEffect(() => {
    if (!isOpen && !isCustomizing) return undefined;
    const onPointerDown = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setIsOpen(false);
      setIsCustomizing(false);
      setError(null);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsCustomizing(false);
        setError(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isCustomizing, isOpen]);

  useEffect(() => {
    if (isCustomizing) inputRef.current?.focus();
  }, [isCustomizing]);

  const panelOpen = isOpen || isCustomizing;

  useLayoutEffect(() => {
    if (!panelOpen) return undefined;
    const place = () => {
      const anchor = buttonRef.current;
      if (!anchor) return;
      const next = placeFloatingPanel(anchor, panelRef.current, isCustomizing ? 148 : 208);
      setPanelStyle((prev) =>
        prev && prev.top === next.top && prev.left === next.left && prev.width === next.width ? prev : next
      );
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [isCustomizing, panelOpen]);

  const save = async (payload) => {
    const nextStatus = parseJobStatus(payload?.jobStatus);
    if (!nextStatus) return;
    const nextCustom = typeof payload.customStatus === "string" ? payload.customStatus.trim() : "";
    const sameStatus = nextStatus === currentStatus;
    const sameCustom =
      nextStatus !== "CUSTOM" || nextCustom === String(job?.customStatus || "").trim();
    if (sameStatus && sameCustom) {
      setIsOpen(false);
      setIsCustomizing(false);
      return;
    }
    if (nextStatus === "CUSTOM" && !nextCustom) {
      setError("Custom status text is required.");
      return;
    }
    if (nextCustom.length > CUSTOM_STATUS_MAX_LENGTH) {
      setError(`Custom status cannot exceed ${CUSTOM_STATUS_MAX_LENGTH} characters.`);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await onSave(job, {
        jobStatus: nextStatus,
        ...(nextStatus === "CUSTOM" ? { customStatus: nextCustom } : {}),
      });
      setIsOpen(false);
      setIsCustomizing(false);
    } catch (err) {
      setError(err?.message || "Job status could not be updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const chooseStatus = (status) => {
    if (status === "CUSTOM") {
      setCustomDraft(typeof job?.customStatus === "string" ? job.customStatus : "");
      setError(null);
      setIsOpen(false);
      setIsCustomizing(true);
      return;
    }
    save({ jobStatus: status });
  };

  return (
    <div className="relative w-[7rem] max-w-full" ref={rootRef} onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        ref={buttonRef}
        aria-controls={menuId}
        disabled={isSaving}
        title="Change job status"
        onClick={() => {
          setError(null);
          setIsCustomizing(false);
          setIsOpen((open) => !open);
        }}
        className={`group flex h-6 w-full min-w-0 items-center gap-1 rounded-md border px-1.5 text-[11px] font-semibold disabled:opacity-60 focus:outline-none focus:ring-0 ${
          currentColor ? "" : "border-line bg-field/70 text-ink"
        }`}
        style={
          currentColor
            ? {
                color: currentColor,
                backgroundColor: `${currentColor}14`,
                borderColor: `${currentColor}40`,
              }
            : undefined
        }
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: currentColor || "#6b7280" }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate text-left">{currentLabel}</span>
        {isSaving ? (
          <Spinner className="h-2.5 w-2.5 shrink-0 text-ink" />
        ) : (
          <svg
            className={`h-3 w-3 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180 text-ink" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen
        ? createPortal(
        <div
          ref={panelRef}
          id={menuId}
          role="listbox"
          aria-label="Job status"
          className="fixed z-[80] max-h-52 min-w-[188px] overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-xl"
          style={{
            top: panelStyle?.top ?? 0,
            left: panelStyle?.left ?? 0,
            width: panelStyle?.width,
            visibility: panelStyle ? "visible" : "hidden",
          }}
        >
          {JOB_STATUS_OPTIONS.map((option) => {
            const selected = option.value === currentStatus;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => chooseStatus(option.value)}
                className={`flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-left text-xs font-medium ${
                  selected ? "bg-field font-semibold text-ink" : "text-ink/80 hover:bg-field/80 hover:text-ink"
                }`}
              >
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: option.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate" style={{ color: option.color }}>
                    {option.label}
                  </span>
                </span>
                {selected ? <span className="text-accent" aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>,
            document.body
          )
        : null}

      {isCustomizing
        ? createPortal(
        <form
          ref={panelRef}
          className="fixed z-[80] w-56 rounded-xl border border-line bg-white p-2 shadow-xl"
          style={{
            top: panelStyle?.top ?? 0,
            left: panelStyle?.left ?? 0,
            visibility: panelStyle ? "visible" : "hidden",
          }}
          onSubmit={(event) => {
            event.preventDefault();
            save({ jobStatus: "CUSTOM", customStatus: customDraft });
          }}
        >
          <label htmlFor={`${menuId}-custom`} className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
            Custom status
          </label>
          <input
            id={`${menuId}-custom`}
            ref={inputRef}
            value={customDraft}
            maxLength={CUSTOM_STATUS_MAX_LENGTH}
            onChange={(event) => setCustomDraft(event.target.value.slice(0, CUSTOM_STATUS_MAX_LENGTH))}
            placeholder="Enter a status label"
            className="mt-1 w-full rounded-lg border border-line bg-field px-2 py-1.5 text-xs text-ink focus:border-ink focus:bg-white focus:outline-none"
          />
          {error ? <p className="mt-1 text-[11px] text-danger">{error}</p> : null}
          <div className="mt-2 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setIsCustomizing(false);
                setError(null);
              }}
              className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-ink px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>,
            document.body
          )
        : null}

      {error && !isCustomizing ? <p className="mt-1 text-[11px] text-danger">{error}</p> : null}
    </div>
  );
}
