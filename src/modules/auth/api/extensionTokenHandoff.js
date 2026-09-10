import { post } from "../../../common/api/httpClient";
import { AUTH_ENDPOINTS } from "./authEndpoints";

export const COPILOT_EXTENSION_ID = String(
  import.meta.env.VITE_EXTENSION_ID || "lghllhgdcekacmdoolnekkkoffcmcaeo"
).trim();

function extensionPayload(data) {
  return {
    type: "COPILOT_EXTENSION_TOKEN",
    accessToken: data.accessToken,
    tokenType: data.tokenType,
    client: data.client,
    expiresIn: data.expiresIn,
  };
}

export async function mintAndPushExtensionToken() {
  try {
    const response = await post(AUTH_ENDPOINTS.EXTENSION_TOKEN, null);
    const data = response?.data;
    if (!response?.success || !data?.accessToken) {
      return {
        ok: false,
        httpStatus: 200,
        error: response?.message || "Could not issue an extension token.",
      };
    }

    const payload = extensionPayload(data);

    if (typeof chrome === "undefined" || typeof chrome.runtime?.sendMessage !== "function") {
      return {
        ok: false,
        httpStatus: 200,
        error: "Install / enable the Copilot Job Capture extension.",
      };
    }

    const reply = await chrome.runtime.sendMessage(COPILOT_EXTENSION_ID, payload);
    return reply || { ok: false, error: "No reply from the extension." };
  } catch (error) {
    return {
      ok: false,
      httpStatus: error?.status ?? null,
      error: error?.message || "Could not issue an extension token.",
    };
  }
}
