import { useState } from "react";
import UserProfileApi from "../../api/userProfileApi";
import Spinner from "../loaders/Spinner";

export default function AdditionalInfoSection({ infos = [], onSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    link: ""
  });

  const handleOpenAdd = () => {
    setFormData({ type: "", description: "", link: "" });
    setEditingId(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (info) => {
    setFormData({
      type: info.type || "",
      description: info.description || "",
      link: info.link || ""
    });
    setEditingId(info.id);
    setError(null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.type) {
      setError("Type is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      if (editingId) {
        await UserProfileApi.updateAdditionalInfo(editingId, formData);
        onSuccess("Information updated successfully ✔");
      } else {
        await UserProfileApi.addAdditionalInfo(formData);
        onSuccess("Information added successfully ✔");
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to save information.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this information?")) return;
    try {
      await UserProfileApi.deleteAdditionalInfo(id);
      onSuccess("Information deleted successfully ✔");
    } catch (err) {
      alert(err?.message || "Failed to delete.");
    }
  };

  // Group by type for better UI
  const groupedInfos = infos.reduce((acc, info) => {
    const type = info.type || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(info);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/60 shadow-sm relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Additional Info</h2>
          <p className="text-sm text-zinc-500 mt-1">Certifications, Awards, Hackathons, etc.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-black hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          + Add
        </button>
      </div>

      <div className="space-y-8">
        {infos.length === 0 ? (
          <div className="text-center py-10 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-sm text-zinc-500 mb-3">No additional information added yet.</p>
            <button onClick={handleOpenAdd} className="text-xs font-medium text-black hover:underline">
              Add information
            </button>
          </div>
        ) : (
          Object.entries(groupedInfos).map(([type, items]) => (
            <div key={type}>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">{type}</h3>
              <div className="space-y-4">
                {items.map(info => (
                  <div key={info.id} className="group flex justify-between items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors">
                    <div className="flex-1">
                      {info.description && <p className="text-sm text-zinc-900 font-medium mb-1.5 whitespace-pre-wrap">{info.description}</p>}
                      {info.link && (
                        <a href={info.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black hover:underline">
                          View Link
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(info)} className="p-1 text-zinc-400 hover:text-black bg-white shadow-sm border border-zinc-200 hover:border-zinc-300 rounded-md">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(info.id)} className="p-1 text-zinc-400 hover:text-red-600 bg-white shadow-sm border border-zinc-200 hover:border-red-200 rounded-md">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">{editingId ? "Edit" : "Add"} Additional Info</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-black">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {error && <div className="text-red-500 text-xs mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
              <form id="info-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Type *</label>
                  <input required name="type" value={formData.type} onChange={handleChange} maxLength={100} placeholder="e.g. Certification, Hackathon, Award..." className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} maxLength={5000} rows={4} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5 block">Link</label>
                  <input type="url" name="link" value={formData.link} onChange={handleChange} maxLength={500} placeholder="https://" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="info-form" disabled={isSaving} className="px-5 py-2.5 text-sm font-medium bg-black text-white hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-2">
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
