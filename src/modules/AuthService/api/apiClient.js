import { API_BASE_URL } from "./authEndpoints";
import { getAuthorizationHeader } from "./tokenStorage";

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_HEADERS = Object.freeze({
    Accept: "application/json",
    "Content-Type": "application/json",
});

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export function buildUrl(endpoint, query = {}) {
    const url = new URL(endpoint, API_BASE_URL);
    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
        else url.searchParams.append(key, value);
    });
    return url.toString();
}

function createTimeoutController(timeout) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    return { controller, timer };
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) return await response.json();
    if (contentType.includes("text/")) return await response.text();
    return await response.blob();
}

export class ApiError extends Error {
    constructor({ message, status, data }) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

function normalizeError(error) {
    if (error instanceof ApiError) return error;
    if (error.name === "AbortError") return new ApiError({ message: "Request timed out.", status: 408, data: null });
    return new ApiError({ message: error.message ?? "Unexpected error occurred.", status: 500, data: null });
}

export async function request({ endpoint, method = "GET", body = null, headers = {}, query = {}, timeout = DEFAULT_TIMEOUT, signal }) {
    const config = await executeRequestInterceptors({ endpoint, method, body, headers, query, timeout, signal });
    const url = buildUrl(config.endpoint, config.query);
    const { controller, timer } = createTimeoutController(config.timeout);

    try {
        const response = await fetch(url, {
            method: config.method,
            headers: { ...DEFAULT_HEADERS, ...config.headers },
            body: config.body === null ? null : JSON.stringify(config.body),
            signal: config.signal ?? controller.signal,
        });

        const data = await parseResponse(response);
        if (!response.ok) {
            throw new ApiError({ message: data?.message ?? response.statusText, status: response.status, data });
        }
        return await executeResponseInterceptors(data);
    } catch (error) {
        throw await executeErrorInterceptors(normalizeError(error));
    } finally {
        clearTimeout(timer);
    }
}

export const get = (endpoint, options = {}) => request({ endpoint, method: "GET", ...options });
export const post = (endpoint, body, options = {}) => request({ endpoint, method: "POST", body, ...options });
export const put = (endpoint, body, options = {}) => request({ endpoint, method: "PUT", body, ...options });
export const patch = (endpoint, body, options = {}) => request({ endpoint, method: "PATCH", body, ...options });
export const del = (endpoint, options = {}) => request({ endpoint, method: "DELETE", ...options });

export const extractData = (response) => response?.data;
export const extractMessage = (response) => response?.message;
export const isSuccess = (response) => response?.success === true;

const requestInterceptors = [];
const responseInterceptors = [];
const errorInterceptors = [];

export const addRequestInterceptor = (interceptor) => requestInterceptors.push(interceptor);
export const addResponseInterceptor = (interceptor) => responseInterceptors.push(interceptor);
export const addErrorInterceptor = (interceptor) => errorInterceptors.push(interceptor);

async function executeRequestInterceptors(config) {
    let current = config;
    for (const interceptor of requestInterceptors) current = await interceptor(current);
    return current;
}
async function executeResponseInterceptors(response) {
    let current = response;
    for (const interceptor of responseInterceptors) current = await interceptor(current);
    return current;
}
async function executeErrorInterceptors(error) {
    let current = error;
    for (const interceptor of errorInterceptors) current = await interceptor(current);
    return current;
}

export function initializeApiClient() {
    addRequestInterceptor(async (config) => {
        const authorization = getAuthorizationHeader();
        if (!authorization) return config;
        return { ...config, headers: { ...config.headers, Authorization: authorization } };
    });
}

export const publicRequest = (config) => request(config);
export const protectedRequest = (config) => request(config);

export async function upload(endpoint, formData, options = {}) {
    const authorization = getAuthorizationHeader();
    const headers = { ...(options.headers ?? {}) };
    if (authorization) headers.Authorization = authorization;

    const response = await fetch(buildUrl(endpoint), { method: "POST", body: formData, headers });
    const data = await parseResponse(response);
    if (!response.ok) throw new ApiError({ status: response.status, message: data?.message ?? response.statusText, data });
    return data;
}

export const download = (endpoint, options = {}) => fetch(buildUrl(endpoint), { headers: options.headers });

const apiClient = { request, get, post, put, patch, delete: del, buildUrl, extractData, extractMessage, isSuccess, upload, download, publicRequest, protectedRequest, addRequestInterceptor, addResponseInterceptor, addErrorInterceptor, initializeApiClient };
export default apiClient;