import { asOptionalText, asPositiveInt, asText, experienceYears, splitSkills } from "../utils/formatters";

function asYear(value) {
  if (value == null || value === "") return null;
  const year = Number.parseInt(String(value), 10);
  return Number.isInteger(year) ? year : null;
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

export function mapWorkExperience(row) {
  const id = asPositiveInt(row?.id);
  if (!id) return null;
  return {
    id,
    companyName: asText(row.companyName),
    jobTitle: asText(row.jobTitle),
    startYear: asYear(row.startYear),
    endYear: asYear(row.endYear),
    description: asOptionalText(row.description),
    createdAt: asOptionalText(row.createdAt),
    updatedAt: asOptionalText(row.updatedAt),
  };
}

export function mapEducation(row) {
  const id = asPositiveInt(row?.id);
  if (!id) return null;
  return {
    id,
    institutionName: asText(row.institutionName),
    field: asText(row.field),
    startYear: asYear(row.startYear),
    endYear: asYear(row.endYear),
    scoreOrGrade: asOptionalText(row.scoreOrGrade),
    createdAt: asOptionalText(row.createdAt),
    updatedAt: asOptionalText(row.updatedAt),
  };
}

export function mapProject(row) {
  const id = asPositiveInt(row?.id);
  if (!id) return null;
  return {
    id,
    projectTitle: asText(row.projectTitle),
    projectDescription: asOptionalText(row.projectDescription),
    projectLink: asOptionalText(row.projectLink),
    createdAt: asOptionalText(row.createdAt),
    updatedAt: asOptionalText(row.updatedAt),
  };
}

export function mapAdditionalInfo(row) {
  const id = asPositiveInt(row?.id);
  if (!id) return null;
  return {
    id,
    type: asText(row.type),
    description: asOptionalText(row.description),
    link: asOptionalText(row.link),
    createdAt: asOptionalText(row.createdAt),
    updatedAt: asOptionalText(row.updatedAt),
  };
}

export function mapProfileLink(row) {
  const id = asPositiveInt(row?.id);
  if (!id) return null;
  return {
    id,
    url: asText(row.url),
    createdAt: asOptionalText(row.createdAt),
    updatedAt: asOptionalText(row.updatedAt),
  };
}

export function mapProfile(payload) {
  const data = payload && typeof payload === "object" ? payload : {};
  return {
    id: asPositiveInt(data.id),
    fullName: asText(data.fullName),
    email: asText(data.email),
    headline: asOptionalText(data.headline),
    summary: asOptionalText(data.summary),
    technicalSkills: asOptionalText(data.technicalSkills),
    workExperiences: asList(data.workExperiences).map(mapWorkExperience).filter(Boolean),
    educations: asList(data.educations).map(mapEducation).filter(Boolean),
    projects: asList(data.projects).map(mapProject).filter(Boolean),
    additionalInformation: asList(data.additionalInformation).map(mapAdditionalInfo).filter(Boolean),
    profileLinks: asList(data.profileLinks).map(mapProfileLink).filter(Boolean),
    createdAt: asOptionalText(data.createdAt),
    updatedAt: asOptionalText(data.updatedAt),
  };
}

export function mapResume(row) {
  const id = asPositiveInt(row?.id);
  if (!id) return null;
  return {
    id,
    originalFilename: asOptionalText(row.originalFilename) || "resume.pdf",
    fileSize: Number.isFinite(Number(row.fileSize)) ? Number(row.fileSize) : 0,
    highPriority: row.highPriority === true,
  };
}

export function mapResumeList(payload) {
  return asList(payload).map(mapResume).filter(Boolean);
}

export function mapResumeUpload(payload) {
  const data = payload && typeof payload === "object" ? payload : {};
  return {
    resumeId: asPositiveInt(data.resumeId),
    message: asOptionalText(data.message),
  };
}

export function mapParseStatus(err) {
  if (!err) return { status: "ready", message: null, retryAfter: null };

  const statusCode = typeof err.status === "number" ? err.status : 0;
  const message = asOptionalText(err.message);

  if (statusCode === 404) {
    return { status: "missing", message: message || "No high-priority resume is ready yet.", retryAfter: null };
  }
  if (statusCode === 409) {
    return {
      status: "pending",
      message: message || "Your resume is still being processed. Please try again in a few moments.",
      retryAfter: null,
    };
  }
  if (statusCode === 422) {
    return {
      status: "failed",
      message: message || "Your resume could not be parsed. Re-upload a PDF from Profile.",
      retryAfter: null,
    };
  }
  if (statusCode === 429) {
    return {
      status: "rateLimited",
      message: message || "Too many requests. Please try again later.",
      retryAfter: Number.isFinite(err.retryAfter) ? err.retryAfter : null,
    };
  }
  return { status: "error", message: message || "Unable to check resume status.", retryAfter: null };
}

export function buildProfileWriteBody({ headline, summary, technicalSkills }) {
  return {
    headline: asText(headline),
    summary: asText(summary),
    technicalSkills: asText(technicalSkills),
  };
}

export function completenessScore(profile, resumeCount = 0) {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.headline),
    Boolean(profile.summary),
    Boolean(profile.technicalSkills),
    profile.workExperiences?.length > 0,
    profile.educations?.length > 0,
    profile.projects?.length > 0,
    profile.profileLinks?.length > 0,
    profile.additionalInformation?.length > 0,
    resumeCount > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function profileStats(profile) {
  const experiences = profile?.workExperiences || [];
  const projects = profile?.projects || [];
  const extras = profile?.additionalInformation || [];
  const skills = splitSkills(profile?.technicalSkills);
  return {
    experienceYears: experienceYears(experiences),
    projectCount: projects.length,
    additionalCount: extras.length,
    skillCount: skills.length,
  };
}
