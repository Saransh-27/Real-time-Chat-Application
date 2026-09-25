import axios from 'axios';
import { isDemoMode } from './demoMode';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log error details for debugging (only in console, not intrusive)
        if (error.response?.data) {
            console.debug('[API Error]', error.response.status, error.response.data);
        }

        // In demo mode, don't redirect on 401 or network errors
        if (isDemoMode()) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path !== '/login' && path !== '/register') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
