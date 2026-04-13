import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Inject Bearer token on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401: try to refresh, then retry once. If refresh fails → logout.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                // Refresh token lives in an HTTP-only cookie
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
                    {},
                    { withCredentials: true }
                );
                return api(original);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('user_name');
                localStorage.removeItem('onboarding_done');
                window.location.href = '/landing';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
