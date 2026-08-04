import { useState, useEffect } from "react";
import JobSpinner from "../loaders/JobSpinner";
import { parseJobJson, getSampleJobJson } from "../../helpers/jobValidators";

export default function AddJobModal({ isOpen, onClose, onSubmit }) {
  const [activeTab, setActiveTab] = useState("json");
  const [jsonInput, setJsonInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setJsonInput("");
    setUrlInput("");
    onClose();
  };

  const handleLoadSample = () => {
    setJsonInput(getSampleJobJson());
    setError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (activeTab === "url") {
      setError("Automated URL crawler & AI parser will be enabled in the upcoming release. Please use the JSON tab to add jobs.");
      return;
    }

    try {
      const parsedData = parseJobJson(jsonInput);
      setIsSubmitting(true);
      await onSubmit(parsedData);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to create job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Add New Job Application</h2>
            <p className="text-xs text-zinc-500">Save and track a target job posting in your Career OS.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-zinc-100 p-1 my-4">
          <button
            type="button"
            onClick={() => { setActiveTab("json"); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "json" ? "bg-white text-black shadow-xs" : "text-zinc-500 hover:text-black"
            }`}
          >
            JSON Formatted Description
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("url"); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "url" ? "bg-white text-black shadow-xs" : "text-zinc-500 hover:text-black"
            }`}
          >
            Job Posting URL
            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-zinc-200 text-zinc-600 font-normal">Coming Soon</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <span className="font-bold shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0 space-y-3">
          {activeTab === "json" ? (
            <div className="flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-700">Paste JSON Payload</label>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-medium text-zinc-500 hover:text-black underline underline-offset-2 transition-colors"
                >
                  Prefill Sample JSON
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{\n  "title": "Software Engineer",\n  "company": "Google",\n  "location": "Bengaluru",\n  "skills": ["Java", "React"]\n}'
                rows={10}
                required
                className="w-full flex-1 p-3 font-mono text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-black focus:outline-none transition-all placeholder:text-zinc-400 text-zinc-900 resize-none"
              />
            </div>
          ) : (
            <div className="py-6 space-y-3">
              <label className="block text-xs font-medium text-zinc-700">Job Posting Web Link</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/123456789"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-500 focus:outline-none cursor-not-allowed"
                disabled
              />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Direct URL parsing will automatically scrape and extract skills, compensation, and qualifications. For now, please switch to the <strong>JSON tab</strong> above.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-medium rounded-xl bg-black text-white hover:bg-zinc-800 transition-all shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? <JobSpinner className="h-3.5 w-3.5 text-white" /> : "Save Job Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
