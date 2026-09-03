import jobApi from "../api/jobApi";

export function createJobFieldHandlers(onUpdate) {
  return {
    title: (job, val) => onUpdate(job, "title", jobApi.updateTitle, val, "Title"),
    company: (job, val) => onUpdate(job, "company", jobApi.updateCompany, val, "Company"),
    location: (job, val) => onUpdate(job, "location", jobApi.updateLocation, val, "Location"),
    workMode: (job, val) => onUpdate(job, "workMode", jobApi.updateWorkMode, val, "Work Mode"),
    employmentType: (job, val) =>
      onUpdate(job, "employmentType", jobApi.updateEmploymentType, val, "Employment Type"),
    salary: (job, val) => onUpdate(job, "salary", jobApi.updateSalary, val, "Salary"),
    experience: (job, val) => onUpdate(job, "experience", jobApi.updateExperience, val, "Experience"),
  };
}
