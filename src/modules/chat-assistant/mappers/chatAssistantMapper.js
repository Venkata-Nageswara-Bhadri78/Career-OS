function asPositiveInt(value) {
  const id = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function asTitle(item) {
  const chatTitle = String(item?.chatTitle ?? "").trim();
  if (chatTitle) return chatTitle;
  const company = String(item?.company ?? "").trim();
  const jobTitle = String(item?.jobTitle ?? "").trim();
  const combined = [company, jobTitle].filter(Boolean).join(" - ");
  return combined || "Untitled chat";
}

export function mapChatSummary(item) {
  const jobId = asPositiveInt(item?.jobId);
  if (!jobId) return null;
  return {
    jobId,
    chatSessionId: asPositiveInt(item?.chatSessionId),
    title: asTitle(item),
    updatedAt: typeof item?.updatedAt === "string" ? item.updatedAt : null,
  };
}

export function mapChatList(payload) {
  const data = payload?.data;
  const rows = Array.isArray(data?.chats) ? data.chats : Array.isArray(data) ? data : [];
  return rows.map(mapChatSummary).filter(Boolean);
}
