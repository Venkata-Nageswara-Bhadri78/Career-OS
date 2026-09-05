import "../styles/user.css";
import useUserProfile from "../hooks/useUserProfile";
import { IconUser } from "../components/common/UserIcons";
import AdditionalInfoSection from "../components/main-components/AdditionalInfoSection";
import EducationSection from "../components/main-components/EducationSection";
import ProfileLinksSection from "../components/main-components/ProfileLinksSection";
import ProfileOverviewCard from "../components/main-components/ProfileOverviewCard";
import ProjectsSection from "../components/main-components/ProjectsSection";
import ResumesSection from "../components/main-components/ResumesSection";
import SuccessSnackbar from "../components/main-components/SuccessSnackbar";
import TechnicalSkillsSection from "../components/main-components/TechnicalSkillsSection";
import WorkExperienceSection from "../components/main-components/WorkExperienceSection";
import UserProfileSkeleton from "../components/skeletons/UserProfileSkeleton";
import Spinner from "../../../common/components/loaders/Spinner";

export default function UserProfilePage() {
  const user = useUserProfile();

  if (user.profileLoad === "loading") {
    return <UserProfileSkeleton />;
  }

  if (user.profileLoad === "error") {
    return (
      <div className="user-service flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-ink">Unable to load profile</h1>
          <p className="mt-2 text-sm text-muted" role="alert">{user.error || "Something went wrong."}</p>
          <button
            type="button"
            onClick={user.reload}
            className="mt-6 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user.hasProfile) {
    return (
      <div className="user-service flex flex-1 items-center justify-center p-6">
        <SuccessSnackbar message={user.successMessage} tone={user.toastTone} onDismiss={user.dismissSuccess} />
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-field text-muted">
            <IconUser className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Welcome to your profile</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Create your career folder to manage headline, history, projects, links, and resumes. Your account stays signed in.
          </p>
          {user.error ? (
            <p className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger" role="alert">
              {user.error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={user.createBlankProfile}
            disabled={user.busy === "create"}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {user.busy === "create" ? <Spinner className="h-5 w-5 text-white" /> : null}
            Set up your profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-service mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
      <SuccessSnackbar message={user.successMessage} tone={user.toastTone} onDismiss={user.dismissSuccess} />

      {user.error ? (
        <p className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {user.error}
        </p>
      ) : null}

      <ProfileOverviewCard
        profile={user.profile}
        completeness={user.completeness}
        busy={user.busy === "profile"}
        onSave={user.saveProfileCard}
      />

      <ResumesSection
        resumes={user.resumes}
        parse={user.parse}
        parseById={user.parseById}
        busy={user.busy}
        onUpload={user.uploadResumeFile}
        onDelete={user.removeResume}
        onSetPrimary={user.markPrimaryResume}
        onDownload={user.downloadResumeFile}
        onPreview={user.previewResumeFile}
      />

      <WorkExperienceSection
        items={user.profile.workExperiences}
        onAdd={user.addExperience}
        onUpdate={user.updateExperience}
        onDelete={user.deleteExperience}
      />

      <ProjectsSection
        items={user.profile.projects}
        onAdd={user.addProject}
        onUpdate={user.updateProject}
        onDelete={user.deleteProject}
      />

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
        <EducationSection
          items={user.profile.educations}
          onAdd={user.addEducation}
          onUpdate={user.updateEducation}
          onDelete={user.deleteEducation}
        />
        <TechnicalSkillsSection
          value={user.profile.technicalSkills}
          profile={user.profile}
          busy={user.busy === "profile"}
          onSave={user.saveProfileCard}
        />
        <AdditionalInfoSection
          items={user.profile.additionalInformation}
          onAdd={user.addAdditionalInfo}
          onUpdate={user.updateAdditionalInfo}
          onDelete={user.deleteAdditionalInfo}
        />
        <ProfileLinksSection
          items={user.profile.profileLinks}
          onAdd={user.addLink}
          onUpdate={user.updateLink}
          onDelete={user.deleteLink}
        />
      </div>
    </div>
  );
}
