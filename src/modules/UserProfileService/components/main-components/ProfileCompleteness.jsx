export default function ProfileCompleteness({ profile }) {
  if (!profile) return null;

  const calculateCompleteness = () => {
    let score = 0;
    let total = 7; // We evaluate 7 aspects of the profile

    if (profile.headline) score++;
    if (profile.summary) score++;
    if (profile.technicalSkills) score++;
    if (profile.workExperiences?.length > 0) score++;
    if (profile.educations?.length > 0) score++;
    if (profile.projects?.length > 0) score++;
    if (profile.profileLinks?.length > 0) score++;

    return Math.round((score / total) * 100);
  };

  const percentage = calculateCompleteness();

  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm flex flex-col md:flex-row md:items-center gap-6 justify-between animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Profile Completeness</h2>
        <p className="text-sm text-zinc-500">A complete profile increases your chances of better AI matches and insights.</p>
      </div>
      <div className="flex-1 max-w-sm flex items-center gap-4">
        <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        <span className="text-sm font-bold text-zinc-900 min-w-12 text-right">{percentage}%</span>
      </div>
    </div>
  );
}
