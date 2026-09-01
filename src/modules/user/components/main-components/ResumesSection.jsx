import { useState, useRef } from "react";
import UserProfileApi from "../../api/userProfileApi";
import Spinner from "../loaders/Spinner";

export default function ResumesSection({ resumes, onUpdate, onSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (resumes.length >= 10) {
      setError("Maximum 10 resumes allowed.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await UserProfileApi.uploadResume(file);
      // Fetch updated resumes list
      const updatedList = await UserProfileApi.getResumes();
      onUpdate(updatedList);
      onSuccess("Resume uploaded successfully ✔");
    } catch (err) {
      setError(err?.message || "Failed to upload resume.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      setError(null);
      await UserProfileApi.deleteResume(id);
      const updatedList = await UserProfileApi.getResumes();
      onUpdate(updatedList);
      onSuccess("Resume deleted successfully ✔");
    } catch (err) {
      setError(err?.message || "Failed to delete resume.");
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleSetPriority = async (id) => {
    try {
      setError(null);
      await UserProfileApi.setHighPriorityResume(id);
      const updatedList = await UserProfileApi.getResumes();
      onUpdate(updatedList);
      onSuccess("High Priority resume updated ✔");
    } catch (err) {
      setError(err?.message || "Failed to set priority.");
    } finally {
      setActiveMenuId(null);
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const url = UserProfileApi.downloadResumeUrl(id);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "resume.pdf");
      link.setAttribute("target", "_blank"); // Fallback open
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onSuccess("Downloading resume... ✔");
    } catch (err) {
      setError("Download failed.");
    } finally {
      setActiveMenuId(null);
    }
  };

  const handlePreview = (id) => {
    const url = UserProfileApi.downloadResumeUrl(id);
    window.open(url, "_blank");
    setActiveMenuId(null);
  };

  // Sort resumes to show high priority first
  const sortedResumes = [...resumes].sort((a, b) => {
    if (a.highPriority && !b.highPriority) return -1;
    if (!a.highPriority && b.highPriority) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt); // newest first
  });

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/60 shadow-sm relative overflow-visible">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Resumes</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage your resumes. Max 10 allowed.</p>
        </div>
        <div className="text-xs font-bold bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-full">
          {resumes.length} / 10
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar relative">
        {/* Priority Divider if exists */}
        {sortedResumes.length > 0 && sortedResumes[0].highPriority && (
          <div className="absolute top-0 bottom-4 left-65 w-px bg-zinc-200 shrink-0 hidden md:block"></div>
        )}

        {sortedResumes.map((resume, idx) => (
          <div 
            key={resume.id} 
            className={`w-60 shrink-0 rounded-2xl border p-4 snap-start relative group flex flex-col justify-between transition-all ${
              resume.highPriority 
                ? 'bg-linear-to-br from-emerald-50 to-white border-emerald-200/60 shadow-sm' 
                : 'bg-white border-zinc-200/60 hover:border-zinc-300'
            }`}
          >
            {resume.highPriority && (
              <div className="absolute -top-2.5 -right-2.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm z-10">
                High Priority
              </div>
            )}
            
            <div className="flex items-start justify-between mb-8">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${resume.highPriority ? 'bg-emerald-100/50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* 3 Dot Menu */}
              <div className="relative">
                <button 
                  onClick={() => setActiveMenuId(activeMenuId === resume.id ? null : resume.id)}
                  className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {activeMenuId === resume.id && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-zinc-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                    <button onClick={() => handlePreview(resume.id)} className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">Preview</button>
                    <button onClick={() => handleDownload(resume.id, resume.originalFilename)} className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">Download</button>
                    {!resume.highPriority && (
                      <button onClick={() => handleSetPriority(resume.id)} className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">Set Priority</button>
                    )}
                    <div className="h-px bg-zinc-100 my-1"></div>
                    <button onClick={() => handleDelete(resume.id)} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900 truncate" title={resume.originalFilename || "Resume"}>
                {resume.originalFilename || "Resume"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(resume.createdAt).toLocaleDateString()} • {(resume.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ))}

        {resumes.length < 10 && (
          <label className="w-60 shrink-0 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50 flex flex-col items-center justify-center p-6 cursor-pointer snap-start transition-colors group">
            {isUploading ? (
              <Spinner className="w-6 h-6 text-black mb-3" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
            <span className="text-sm font-bold text-zinc-900">Upload Resume</span>
            <span className="text-xs text-zinc-400 mt-1">PDF max 5MB</span>
            <input 
              type="file" 
              accept=".pdf,application/pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        )}
        
        {resumes.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed ml-4">
            <p className="text-sm text-zinc-500">No resumes added yet.</p>
          </div>
        )}
      </div>

      {/* Global click handler to close menu */}
      {activeMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
      )}
    </div>
  );
}
