import { useState } from "react";
import UserProfileApi from "../../api/userProfileApi";
import Spinner from "../loaders/Spinner";

export default function ProjectsSection({ projects = [], onSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    projectTitle: "",
    projectDescription: "",
    projectLink: ""
  });

  const handleOpenAdd = () => {
    setFormData({ projectTitle: "", projectDescription: "", projectLink: "" });
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setFormData({
      projectTitle: proj.projectTitle || "",
      projectDescription: proj.projectDescription || "",
      projectLink: proj.projectLink || ""
    });
    setEditingId(proj.id);
    setError(null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.projectTitle) {
      setError("Project Title is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      if (editingId) {
        await UserProfileApi.updateProject(editingId, formData);
        onSuccess("Project updated successfully ✔");
      } else {
        await UserProfileApi.addProject(formData);
        onSuccess("Project added successfully ✔");
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await UserProfileApi.deleteProject(id);
      onSuccess("Project deleted successfully ✔");
    } catch (err) {
      alert(err?.message || "Failed to delete.");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/60 shadow-sm relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Projects</h2>
          <p className="text-sm text-zinc-500 mt-1">Showcase your work and side projects.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-black hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          + Add
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-sm text-zinc-500 mb-3">No projects added yet.</p>
            <button onClick={handleOpenAdd} className="text-xs font-medium text-black hover:underline">
              Add your first project
            </button>
          </div>
        ) : (
          projects.map((proj) => (
            <div key={proj.id} className="group p-5 rounded-2xl border border-zinc-200/60 hover:border-zinc-300 bg-white shadow-sm transition-all relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold text-zinc-900 pr-8">{proj.projectTitle}</h3>
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(proj)} className="p-1 text-zinc-400 hover:text-black bg-zinc-50 hover:bg-zinc-100 rounded-md">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(proj.id)} className="p-1 text-zinc-400 hover:text-red-600 bg-zinc-50 hover:bg-red-50 rounded-md">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                {proj.projectDescription && (
                  <p className="text-sm text-zinc-600 mb-4 line-clamp-3 leading-relaxed">{proj.projectDescription}</p>
                )}
              </div>
              {proj.projectLink && (
                <a href={proj.projectLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-black hover:underline mt-auto">
                  View Project
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">{editingId ? "Edit" : "Add"} Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && <div className="text-red-500 text-xs mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
              <form id="proj-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Project Title *</label>
                  <input required name="projectTitle" value={formData.projectTitle} onChange={handleChange} maxLength={300} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Project Link</label>
                  <input type="url" name="projectLink" value={formData.projectLink} onChange={handleChange} maxLength={500} placeholder="https://" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea name="projectDescription" value={formData.projectDescription} onChange={handleChange} maxLength={5000} rows={4} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none" />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="proj-form" disabled={isSaving} className="px-5 py-2.5 text-sm font-medium bg-black text-white hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-2">
                {isSaving && <Spinner className="w-4 h-4 text-white" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
