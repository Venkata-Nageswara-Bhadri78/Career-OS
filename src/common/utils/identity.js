export function getDisplayName(user) {
  const fullName = String(user?.fullName ?? "").trim();
  if (fullName) return fullName;
  const username = String(user?.username ?? "").trim();
  if (username) return username;
  return "Account";
}

export function getNameInitial(user) {
  const fullName = String(user?.fullName ?? "").trim();
  const username = String(user?.username ?? "").trim();
  const email = String(user?.email ?? "").trim();
  const source = fullName || username || email || "A";
  return Array.from(source)[0].toLocaleUpperCase();
}
