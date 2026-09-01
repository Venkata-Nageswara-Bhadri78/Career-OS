import { API_BASE_URL, CHAT_ASSISTANT_ENDPOINTS } from "./chatAssistantEndpoints";
import { getAuthorizationHeader } from "../../auth/api/tokenStorage";

class ApiError extends Error {
    constructor({ message, status, data }) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthorizationHeader();
    
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new ApiError({
                message: data?.message || response.statusText,
                status: response.status,
                data,
            });
        }
        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError({ message: error.message || "Network error occurred.", status: 500, data: null });
    }
};

export const fetchChatList = () => {
    return request(CHAT_ASSISTANT_ENDPOINTS.LIST, { method: "GET" });
};

export const fetchJobChatHistory = (jobId) => {
    return request(CHAT_ASSISTANT_ENDPOINTS.HISTORY(jobId), { method: "GET" });
};

export const sendJobChatMessage = (jobId, prompt) => {
    return request(CHAT_ASSISTANT_ENDPOINTS.SEND_MESSAGE(jobId), {
        method: "POST",
        body: JSON.stringify({ prompt }),
    });
};

export const deleteJobChat = (jobId) => {
    return request(CHAT_ASSISTANT_ENDPOINTS.DELETE(jobId), { method: "DELETE" });
};
