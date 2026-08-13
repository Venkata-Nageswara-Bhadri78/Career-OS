import { useState } from "react";
import UserProfileApi from "../../api/userProfileApi";
import Spinner from "../loaders/Spinner";

export default function WorkExperienceSection({ experiences = [], onSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // If editingId is null, it's a create operation
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    startYear: "",
    endYear: "",
    description: ""
  });

  const handleOpenAdd = () => {
    setFormData({ companyName: "", jobTitle: "", startYear: "", endYear: "", description: "" });
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setFormData({
      companyName: exp.companyName || "",
      jobTitle: exp.jobTitle || "",
      startYear: exp.startYear || "",
      endYear: exp.endYear || "",
      description: exp.description || ""
    });
    setEditingId(exp.id);
    setError(null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.jobTitle || !formData.startYear) {
      setError("Company Name, Job Title, and Start Year are required.");
      return;
    }

    const payload = {
      ...formData,
      startYear: parseInt(formData.startYear, 10),
      endYear: formData.endYear ? parseInt(formData.endYear, 10) : null
    };

    try {
      setIsSaving(true);
      setError(null);
      if (editingId) {
        await UserProfileApi.updateExperience(editingId, payload);
        onSuccess("Work experience updated successfully ✔");
      } else {
        await UserProfileApi.addExperience(payload);
        onSuccess("Work experience added successfully ✔");
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to save work experience.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this experience?")) return;
    try {
      await UserProfileApi.deleteExperience(id);
      onSuccess("Work experience deleted successfully ✔");
    } catch (err) {
      alert(err?.message || "Failed to delete.");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/60 shadow-sm relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Work Experience</h2>
          <p className="text-sm text-zinc-500 mt-1">Your professional background.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-black hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          + Add
        </button>
      </div>

      <div className="space-y-6">
        {experiences.length === 0 ? (
          <div className="text-center py-10 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-sm text-zinc-500 mb-3">No work experience added yet.</p>
            <button onClick={handleOpenAdd} className="text-xs font-medium text-black hover:underline">
              Add your first experience
            </button>
          </div>
        ) : (
          experiences.map((exp, idx) => (
            <div key={exp.id} className="group flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-zinc-300 rounded-full mt-1.5 group-hover:bg-black transition-colors"></div>
                {idx !== experiences.length - 1 && <div className="w-px h-full bg-zinc-200 my-1 group-hover:bg-zinc-300 transition-colors"></div>}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">{exp.jobTitle}</h3>
                    <p className="text-sm font-medium text-zinc-600">{exp.companyName}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {exp.startYear} - {exp.endYear || "Present"}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(exp)} className="p-1.5 text-zinc-400 hover:text-black bg-zinc-50 hover:bg-zinc-100 rounded-md">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-zinc-400 hover:text-red-600 bg-zinc-50 hover:bg-red-50 rounded-md">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                {exp.description && <p className="text-sm text-zinc-600 mt-3 whitespace-pre-wrap leading-relaxed">{exp.description}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">{editingId ? "Edit" : "Add"} Experience</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && <div className="text-red-500 text-xs mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
              <form id="exp-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Job Title *</label>
                  <input required name="jobTitle" value={formData.jobTitle} onChange={handleChange} maxLength={200} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Company Name *</label>
                  <input required name="companyName" value={formData.companyName} onChange={handleChange} maxLength={200} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Start Year *</label>
                    <input required type="number" name="startYear" value={formData.startYear} onChange={handleChange} min={1900} max={2100} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">End Year</label>
                    <input type="number" name="endYear" value={formData.endYear} onChange={handleChange} min={1900} max={2100} placeholder="Present" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} maxLength={5000} rows={4} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none" />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="exp-form" disabled={isSaving} className="px-5 py-2.5 text-sm font-medium bg-black text-white hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-2">
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
