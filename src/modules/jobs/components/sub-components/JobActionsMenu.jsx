import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Spinner from "../../../../common/components/loaders/Spinner";
import jobApi from "../../api/jobApi";

const NOTES_MAX_LENGTH = 5000;
const MENU_GAP = 4;
const VIEWPORT_PAD = 8;

function placeFloatingPanel(anchor, panel, estimatedHeight, estimatedWidth) {
  const rect = anchor.getBoundingClientRect();
  const height = panel?.offsetHeight || estimatedHeight;
  const width = Math.max(panel?.offsetWidth || estimatedWidth, rect.width);
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < height + MENU_GAP && rect.top > spaceBelow;
  let top = openUp ? rect.top - height - MENU_GAP : rect.bottom + MENU_GAP;
  top = Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - height - VIEWPORT_PAD));
  let left = rect.right - width;
  left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));
  return { top, left, width };
}

export default function JobActionsMenu({ job, onDeleteClick, onNotesSaved }) {
  const notesId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [panelStyle, setPanelStyle] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const savingRef = useRef(false);

  const panelOpen = isOpen || isNotesOpen;

  useEffect(() => {
    if (!panelOpen) return undefined;
    const onPointerDown = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setIsOpen(false);
      setIsNotesOpen(false);
      setError(null);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsNotesOpen(false);
        setError(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panelOpen]);

  useLayoutEffect(() => {
    if (!panelOpen) return undefined;
    const place = () => {
      const anchor = buttonRef.current;
      if (!anchor) return;
      const next = placeFloatingPanel(anchor, panelRef.current, isNotesOpen ? 228 : 120, isNotesOpen ? 300 : 132);
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
  }, [isNotesOpen, panelOpen]);

  const openNotes = () => {
    setNotes(typeof job?.notes === "string" ? job.notes : "");
    setError(null);
    setIsOpen(false);
    setIsNotesOpen(true);
  };

  const saveNotes = async (event) => {
    event?.preventDefault?.();
    if (savingRef.current) return;
    const jobId = Number(job?.id);
    if (!Number.isInteger(jobId) || jobId <= 0) {
      setError("Job not found.");
      return;
    }
    const next = notes.slice(0, NOTES_MAX_LENGTH);
    savingRef.current = true;
    setIsSaving(true);
    setError(null);
    try {
      const saved = await jobApi.updateNotes(jobId, next);
      setIsNotesOpen(false);
      await onNotesSaved?.(saved);
    } catch (err) {
      setError(err?.message || "Notes could not be saved.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const panelPosition = {
    top: panelStyle?.top ?? 0,
    left: panelStyle?.left ?? 0,
    visibility: panelStyle ? "visible" : "hidden",
  };

  return (
    <div className="relative inline-flex" ref={rootRef} onClick={(event) => event.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setError(null);
          setIsNotesOpen(false);
          setIsOpen((prev) => !prev);
        }}
        title="More actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="rounded-lg p-1 text-muted transition-colors hover:bg-field hover:text-ink"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={panelRef}
              role="menu"
              className="fixed z-[80] w-max rounded-xl border border-line bg-white p-1 shadow-xl"
              style={panelPosition}
            >
              <button
                type="button"
                role="menuitem"
                disabled
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-muted opacity-60 cursor-not-allowed"
              >
                Edit details
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={openNotes}
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-ink transition-colors hover:bg-field"
              >
                Add notes
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onDeleteClick(job);
                }}
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-danger transition-colors hover:bg-red-50"
              >
                Delete job
              </button>
            </div>,
            document.body
          )
        : null}

      {isNotesOpen
        ? createPortal(
            <form
              ref={panelRef}
              className="fixed z-[80] w-[300px] rounded-xl border border-line bg-white p-2 shadow-xl"
              style={panelPosition}
              onSubmit={saveNotes}
            >
              <label htmlFor={notesId} className="block text-[10px] font-semibold uppercase tracking-wide text-muted">
                Notes
              </label>
              <textarea
                id={notesId}
                value={notes}
                maxLength={NOTES_MAX_LENGTH}
                rows={5}
                onChange={(event) => setNotes(event.target.value.slice(0, NOTES_MAX_LENGTH))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    saveNotes(event);
                  }
                }}
                placeholder="Add notes about this job..."
                className="mt-1 w-full resize-none rounded-lg border border-line bg-field px-2 py-1.5 text-xs leading-relaxed text-ink focus:border-ink focus:bg-white focus:outline-none"
              />
              <div className="mt-1 text-right text-[10px] text-muted">
                {notes.length.toLocaleString()}/{NOTES_MAX_LENGTH.toLocaleString()}
              </div>
              {error ? <p className="mt-1 text-[11px] text-danger">{error}</p> : null}
              <div className="mt-2 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotesOpen(false);
                    setError(null);
                  }}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1 rounded-lg bg-ink px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                >
                  {isSaving ? <Spinner className="h-3 w-3 text-white" /> : null}
                  Save
                </button>
              </div>
            </form>,
            document.body
          )
        : null}
    </div>
  );
}
