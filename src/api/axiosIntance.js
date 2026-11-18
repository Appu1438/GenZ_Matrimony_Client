
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Maintain independent refresh states for members and admins.
const refreshStates = {
    member: {
        isRefreshing: false,
        failedQueue: [],
        refreshUrl: "/auth/refresh",
        expiredEvent: "auth:session-expired",
    },

    admin: {
        isRefreshing: false,
        failedQueue: [],
        refreshUrl: "/admin/auth/refresh",
        expiredEvent: "admin:session-expired",
    },
};

// Determine whether the request belongs to the admin portal.
const isAdminRequest = (url = "") => {
    return /(?:^|\/)admin(?:\/|$)/.test(url);
};

// Identify endpoints that should never trigger token refresh.
const isAuthEndpoint = (url = "") => {
    return /\/(?:admin\/)?auth\/(?:login|refresh|register|verify-email|resend-verification|forgot-password|reset-password|logout)(?:[/?]|$)/.test(
        url
    );
};

// Process queued requests after refresh completes.
const processQueue = (state, error = null) => {
    state.failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    });

    state.failedQueue = [];
};

// Handle expired sessions.
const dispatchSessionExpired = (state) => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new Event(state.expiredEvent)
        );
    }
};

// Response interceptor.
axiosInstance.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // No request configuration or not an unauthorized response.
        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || "";

        // Do not refresh login, logout, or other auth endpoints.
        if (isAuthEndpoint(requestUrl)) {
            return Promise.reject(error);
        }

        // Do not retry the same request more than once.
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // Select the correct independent authentication system.
        const authType = isAdminRequest(requestUrl)
            ? "admin"
            : "member";

        const state = refreshStates[authType];

        // Mark before queuing so the request cannot enter another refresh cycle.
        originalRequest._retry = true;

        // If another request is already refreshing this session,
        // wait for that refresh to complete.
        if (state.isRefreshing) {
            return new Promise((resolve, reject) => {
                state.failedQueue.push({
                    resolve,
                    reject,
                });
            }).then(() => {
                return axiosInstance(originalRequest);
            });
        }

        state.isRefreshing = true;

        try {
            // Refresh the appropriate authentication session.
            await axiosInstance.post(state.refreshUrl);

            // Release requests waiting for this refresh.
            processQueue(state);

            // Retry the original request with the updated cookie.
            return axiosInstance(originalRequest);

        } catch (refreshError) {
            // Reject all queued requests.
            processQueue(state, refreshError);

            // Notify only the relevant authentication context.
            dispatchSessionExpired(state);

            return Promise.reject(refreshError);

        } finally {
            state.isRefreshing = false;
        }
    }
);

export default axiosInstance;
