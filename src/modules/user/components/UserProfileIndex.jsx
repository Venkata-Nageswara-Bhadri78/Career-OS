import { useState, useEffect } from "react";
import UserProfileApi from "../api/userProfileApi";
import UserProfileSkeleton from "./skeletons/UserProfileSkeleton";
import SuccessSnackbar from "./main-components/SuccessSnackbar";
import ProfileHeader from "./main-components/ProfileHeader";
import ProfileCompleteness from "./main-components/ProfileCompleteness";
import ResumesSection from "./main-components/ResumesSection";
import WorkExperienceSection from "./main-components/WorkExperienceSection";
import EducationSection from "./main-components/EducationSection";
import ProjectsSection from "./main-components/ProjectsSection";
import AdditionalInfoSection from "./main-components/AdditionalInfoSection";
import ProfileLinksSection from "./main-components/ProfileLinksSection";
import Spinner from "./loaders/Spinner";

export default function UserProfileIndex() {
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  
  const [successMessage, setSuccessMessage] = useState("");

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedProfile, fetchedResumes] = await Promise.all([
        UserProfileApi.getProfile().catch(e => {
          if (e?.status === 404) return null; // Profile not found
          throw e;
        }),
        UserProfileApi.getResumes().catch(() => []) // Default to empty array if resumes fail
      ]);
      setProfile(fetchedProfile);
      setResumes(fetchedResumes);
    } catch (err) {
      setError(err?.message || "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleCreateProfile = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const newProfile = await UserProfileApi.createProfile({});
      setProfile(newProfile);
      showSuccess("Profile created successfully!");
    } catch (err) {
      setError(err?.message || "Failed to create profile.");
    } finally {
      setIsCreating(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (isLoading) return <UserProfileSkeleton />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-zinc-100">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-3">Welcome to your Profile</h1>
          <p className="text-zinc-500 mb-8 text-sm leading-relaxed">
            Create your career profile to get personalized job matches, AI assistance, and easily manage your applications.
          </p>
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          <button
            onClick={handleCreateProfile}
            disabled={isCreating}
            className="w-full bg-black hover:bg-zinc-800 text-white font-medium py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
          >
            {isCreating ? <Spinner className="w-5 h-5 text-white" /> : "Set up your profile"}
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "header", label: "Profile Info" },
    { id: "resumes", label: "Resumes" },
    { id: "experience", label: "Work Experience" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "links", label: "Profile Links" },
    { id: "additional", label: "Additional Info" }
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20">
      {successMessage && (
        <SuccessSnackbar message={successMessage} onDismiss={() => setSuccessMessage("")} />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Progress Bar spanning full width */}
        <div className="mb-8">
          <ProfileCompleteness profile={profile} />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          {/* Left Sidebar Navigation (20-30%) */}
          <div className="w-full md:w-[25%] shrink-0 sticky top-8 bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-zinc-200/60 shadow-sm hidden md:block">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 px-3">Sections</h3>
            <nav className="flex flex-col space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className="text-left px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition-all"
                >
                  {sec.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0 flex flex-col gap-10 md:w-[75%]">
            <div id="header" className="scroll-mt-8">
              <ProfileHeader profile={profile} onUpdate={(updated) => { setProfile(updated); showSuccess("Profile updated successfully!"); }} />
            </div>

            <div id="resumes" className="scroll-mt-8">
              <ResumesSection resumes={resumes} onUpdate={setResumes} onSuccess={showSuccess} />
            </div>

            <div id="experience" className="scroll-mt-8">
              <WorkExperienceSection 
                experiences={profile.workExperiences || []} 
                onSuccess={(msg) => { fetchProfileData(); showSuccess(msg); }} 
              />
            </div>

            <div id="education" className="scroll-mt-8">
              <EducationSection 
                educations={profile.educations || []} 
                onSuccess={(msg) => { fetchProfileData(); showSuccess(msg); }} 
              />
            </div>

            <div id="projects" className="scroll-mt-8">
              <ProjectsSection 
                projects={profile.projects || []} 
                onSuccess={(msg) => { fetchProfileData(); showSuccess(msg); }} 
              />
            </div>

            <div id="links" className="scroll-mt-8">
              <ProfileLinksSection 
                links={profile.profileLinks || []} 
                onSuccess={(msg) => { fetchProfileData(); showSuccess(msg); }} 
              />
            </div>

            <div id="additional" className="scroll-mt-8">
              <AdditionalInfoSection 
                infos={profile.additionalInformation || []} 
                onSuccess={(msg) => { fetchProfileData(); showSuccess(msg); }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
