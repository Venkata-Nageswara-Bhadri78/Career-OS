import { useState, useEffect } from "react";
import JobSpinner from "../loaders/JobSpinner";

export default function DeleteConfirmModal({ isOpen, job, onConfirm, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isDeleting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !job) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(job.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-black">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">Delete Job Application</h3>
            <p className="text-xs text-zinc-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="my-4 rounded-xl bg-zinc-50 p-3 border border-zinc-200/60 text-xs text-zinc-700">
          <p className="font-semibold text-zinc-900">{job.title || "Untitled Role"}</p>
          <p className="text-zinc-500 mt-0.5">{job.company || "Unknown Company"} {job.location ? `• ${job.location}` : ""}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-black text-white hover:bg-zinc-800 transition-all shadow-xs disabled:opacity-50"
          >
            {isDeleting ? <JobSpinner className="h-3.5 w-3.5 text-white" /> : "Delete Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
