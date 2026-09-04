import { ApiError, CLIENT_COPY } from "./apiError";

export function unwrapApiResponse(res, fallbackStatus = 400) {
  if (res && typeof res === "object" && res.success === false) {
    throw new ApiError({
      message: typeof res.message === "string" && res.message.trim() ? res.message : CLIENT_COPY.generic,
      status: fallbackStatus,
      data: res,
    });
  }
  if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
    return res.data;
  }
  return res;
}

export default unwrapApiResponse;
