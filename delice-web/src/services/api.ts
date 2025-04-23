import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error?.message || 'Ocorreu um erro inesperado';
        toast.error(message);
        return Promise.reject(error);
    }
);

// Add a request interceptor to add the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth service
export const authService = {
    register: async (data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        document: string;
    }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (data: { email: string; password: string }) => {
        const response = await api.post('/auth/login', data);
        return response.data.data;
    },

    verifyEmail: async (data: { token: string; code: string }) => {
        const response = await api.post('/auth/verify-email', data);
        return response.data;
    },

    verifyPhone: async (data: { token: string; code: string }) => {
        const response = await api.post('/auth/verify-phone', data);
        return response.data;
    },

    resendCode: async (data: { token: string; type: 'email' | 'phone' | 'both' }) => {
        const response = await api.post('/auth/resend-code', data);
        return response.data;
    },
};

// User service
export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data.data;
    },

    updateProfile: async (data: {
        name?: string;
        avatar_url?: string;
    }) => {
        const response = await api.put('/users/profile', data);
        return response.data.data;
    },

    changePassword: async (data: {
        oldPassword: string;
        newPassword: string;
    }) => {
        const response = await api.put('/users/change-password', data);
        return response.data;
    },
};

export default api; 