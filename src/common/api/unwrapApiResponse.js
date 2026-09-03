export function unwrapApiResponse(res) {
  if (res && res.success === false) throw new Error(res.message || "API request failed");
  return res?.data !== undefined ? res.data : res;
}

export default unwrapApiResponse;
