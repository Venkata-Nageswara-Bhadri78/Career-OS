import { useEffect, useRef, useState } from "react";

export default function JobActionsMenu({ job, onDeleteClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="More actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="p-1 rounded-lg text-muted hover:text-ink hover:bg-field transition-colors"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-[150px] rounded-xl border border-line bg-white shadow-xl p-1 z-50"
        >
          <button
            type="button"
            role="menuitem"
            disabled
            className="w-full px-3 py-2 text-left text-xs font-medium text-muted rounded-lg cursor-not-allowed opacity-60"
          >
            Edit details
          </button>
          <button
            type="button"
            role="menuitem"
            disabled
            className="w-full px-3 py-2 text-left text-xs font-medium text-muted rounded-lg cursor-not-allowed opacity-60"
          >
            Share job
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDeleteClick(job);
            }}
            className="w-full px-3 py-2 text-left text-xs font-medium text-danger rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete job
          </button>
        </div>
      ) : null}
    </div>
  );
}
