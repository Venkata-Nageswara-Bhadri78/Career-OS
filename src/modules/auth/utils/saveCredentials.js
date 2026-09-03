export async function offerToSaveCredentials({ email, password, fullName }) {
  if (typeof window === "undefined" || !email || !password) return;
  if (typeof window.PasswordCredential !== "function" || !navigator.credentials?.store) return;

  try {
    const credential = new window.PasswordCredential({
      id: email,
      password,
      name: fullName || email,
    });
    await navigator.credentials.store(credential);
  } catch {
    /* dismissed, unsupported, or blocked */
  }
}
