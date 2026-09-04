function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function parseServerDateTime(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const second = Number(match[6] ?? 0);
  const date = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function groupChatsByRecency(chats) {
  const today = startOfLocalDay(new Date());
  const yesterday = today - 24 * 60 * 60 * 1000;
  const groups = [
    { id: "today", label: "Today", items: [] },
    { id: "yesterday", label: "Yesterday", items: [] },
    { id: "older", label: "Older", items: [] },
  ];

  (Array.isArray(chats) ? chats : []).forEach((chat) => {
    const parsed = parseServerDateTime(chat?.updatedAt);
    const day = parsed ? startOfLocalDay(parsed) : null;
    if (day === today) groups[0].items.push(chat);
    else if (day === yesterday) groups[1].items.push(chat);
    else groups[2].items.push(chat);
  });

  return groups.filter((group) => group.items.length > 0);
}
