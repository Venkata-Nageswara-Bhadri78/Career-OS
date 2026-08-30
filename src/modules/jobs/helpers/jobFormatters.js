export function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

export function getWorkModeClass(mode) {
  const normalized = (mode || "").toLowerCase();
  if (normalized.includes("remote")) return "bg-zinc-900 text-white border-zinc-700";
  if (normalized.includes("hybrid")) return "bg-zinc-200 text-zinc-800 border-zinc-300";
  return "bg-zinc-100 text-zinc-700 border-zinc-200";
}

export function getEmploymentTypeClass(type) {
  const normalized = (type || "").toLowerCase();
  if (normalized.includes("full")) return "bg-black/5 text-black border-black/10";
  if (normalized.includes("contract")) return "bg-zinc-200/80 text-zinc-800 border-zinc-300";
  return "bg-zinc-100 text-zinc-600 border-zinc-200";
}

export function truncate(text, length = 40) {
  if (!text) return "—";
  return text.length > length ? `${text.slice(0, length)}...` : text;
}
