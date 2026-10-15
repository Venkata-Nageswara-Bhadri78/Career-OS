const SCRIPT_ID = "google-identity-services";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let loadPromise = null;

export function loadGoogleIdentityServices() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is unavailable."));
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const finish = () => {
        if (window.google?.accounts?.id) resolve(window.google);
        else {
          loadPromise = null;
          document.getElementById(SCRIPT_ID)?.remove();
          reject(new Error("Google sign-in is unavailable."));
        }
      };
      const fail = () => {
        loadPromise = null;
        reject(new Error("Unable to load Google sign-in. You can still use email and password."));
      };

      const existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        if (existing.dataset.loaded === "true") {
          finish();
          return;
        }
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", fail, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        script.dataset.loaded = "true";
        finish();
      };
      script.onerror = () => {
        script.remove();
        fail();
      };
      document.head.appendChild(script);
    });
  }
  return loadPromise;
}
