export function hasUsername(user) {
  return typeof user?.username === "string" && user.username.trim().length > 0;
}
