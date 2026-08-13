import { useState } from "react";
import UserProfileApi from "../../api/userProfileApi";
import Spinner from "../loaders/Spinner";

export default function ProfileHeader({ profile, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    headline: profile?.headline || "",
    summary: profile?.summary || "",
    technicalSkills: profile?.technicalSkills || ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const updatedProfile = await UserProfileApi.updateProfile({
        headline: formData.headline,
        summary: formData.summary,
        technicalSkills: formData.technicalSkills
      });
      onUpdate(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err?.message || "Failed to save profile header.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/60 shadow-sm relative group overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-tr from-zinc-800 to-black text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shrink-0">
            {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{profile?.fullName || "User"}</h1>
            <p className="text-sm text-zinc-500 font-medium">{profile?.email || "No email provided"}</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-xl transition-all"
            title="Edit Profile"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative z-10">
        {isEditing ? (
          <div className="space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
            {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-xl border border-red-100">{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Headline</label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                maxLength={300}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="e.g. Java Backend Developer | Spring Boot"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Summary</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                maxLength={5000}
                rows={4}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                placeholder="Briefly describe your experience and goals..."
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Technical Skills</label>
              <textarea
                name="technicalSkills"
                value={formData.technicalSkills}
                onChange={handleChange}
                maxLength={3000}
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                placeholder="e.g. Java, Spring Boot, PostgreSQL..."
              />
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ headline: profile?.headline || "", summary: profile?.summary || "", technicalSkills: profile?.technicalSkills || "" });
                  setError(null);
                }}
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-medium bg-black hover:bg-zinc-800 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-black/5"
              >
                {isSaving && <Spinner className="w-4 h-4 text-white" />}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {profile?.headline && (
              <div>
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Headline</h3>
                <p className="text-zinc-900 font-medium text-base">{profile.headline}</p>
              </div>
            )}
            
            {profile?.summary && (
              <div>
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Summary</h3>
                <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">{profile.summary}</p>
              </div>
            )}
            
            {profile?.technicalSkills && (
              <div>
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.technicalSkills.split(',').map((skill, idx) => {
                    const s = skill.trim();
                    if (!s) return null;
                    return (
                      <span key={idx} className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded-lg text-xs font-medium border border-zinc-200/50">
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {!profile?.headline && !profile?.summary && !profile?.technicalSkills && (
              <div className="text-center py-6 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                <p className="text-sm text-zinc-500 mb-3">Your profile info is empty.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-medium bg-white border border-zinc-200 hover:border-zinc-300 px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Add Profile Info
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
