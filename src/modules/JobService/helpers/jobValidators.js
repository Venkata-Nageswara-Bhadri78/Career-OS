export function parseJobJson(rawInput) {
  if (!rawInput || typeof rawInput !== "string") {
    throw new Error("Please paste valid JSON text.");
  }
  let parsed;
  try {
    parsed = JSON.parse(rawInput.trim());
  } catch {
    throw new Error("Invalid JSON format. Please verify syntax.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON payload must be a key-value object.");
  }

  const skills = Array.isArray(parsed.skills)
    ? parsed.skills.map((s) => String(s).trim()).filter(Boolean)
    : typeof parsed.skills === "string"
    ? parsed.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const title = parsed.title || parsed.role || parsed.jobTitle || parsed.position || null;
  const company = parsed.company || parsed.companyName || parsed.organization || null;
  const location = parsed.location || parsed.city || null;
  const employmentType = parsed.employmentType || parsed.jobType || parsed.type || null;
  const workMode = parsed.workMode || parsed.mode || null;
  const experience = parsed.experience || parsed.exp || null;
  const salary = parsed.salary || parsed.compensation || parsed.pay || null;
  const education = parsed.education || parsed.degree || null;
  const department = parsed.department || parsed.team || null;
  const industry = parsed.industry || parsed.domain || null;
  const sourcePlatform = parsed.sourcePlatform || parsed.platform || parsed.source || null;
  const sourceUrl = parsed.sourceUrl || parsed.url || parsed.link || parsed.jobUrl || null;
  const originalDescription = parsed.originalDescription || parsed.rawDescription || parsed.description || null;
  const description = parsed.description || parsed.cleanedDescription || originalDescription || null;

  return {
    title: title ? String(title).trim() : null,
    company: company ? String(company).trim() : null,
    location: location ? String(location).trim() : null,
    employmentType: employmentType ? String(employmentType).trim() : null,
    workMode: workMode ? String(workMode).trim() : null,
    experience: experience ? String(experience).trim() : null,
    salary: salary ? String(salary).trim() : null,
    education: education ? String(education).trim() : null,
    department: department ? String(department).trim() : null,
    industry: industry ? String(industry).trim() : null,
    sourcePlatform: sourcePlatform ? String(sourcePlatform).trim() : null,
    sourceUrl: sourceUrl ? String(sourceUrl).trim() : null,
    description: description ? String(description).trim() : null,
    originalDescription: originalDescription ? String(originalDescription).trim() : null,
    skills,
  };
}

export function getSampleJobJson() {
  return JSON.stringify(
    {
      title: "Senior Full Stack Engineer",
      company: "Stripe",
      location: "San Francisco, CA (or Remote)",
      employmentType: "Full Time",
      workMode: "Hybrid",
      experience: "4-7 Years",
      salary: "$160,000 - $210,000",
      education: "Bachelor's in CS or equivalent",
      department: "Core Engineering",
      industry: "Financial Technology",
      sourcePlatform: "LinkedIn",
      sourceUrl: "https://stripe.com/jobs/senior-engineer",
      skills: ["React", "Node.js", "Java", "Spring Boot", "PostgreSQL", "Docker", "AWS"],
      description: "Design and build scalable APIs and rich frontend applications across high-throughput payment systems.",
      originalDescription: "Full job posting text from Stripe careers portal.",
    },
    null,
    2
  );
}
