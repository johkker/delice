import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginData, RegisterData, VerificationData, ResendCodeData } from '../types/auth';
import { API_URL } from '../config/env';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        return Promise.reject(error);
    }
);

export const authService = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        try {
            console.log("API:", api)
            const response = await api.post<AuthResponse>('/auth/register', data);
            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', data);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    verifyEmail: async (data: VerificationData): Promise<{ success: boolean }> => {
        try {
            const response = await api.post<{ success: boolean }>('/auth/verify-email', data);
            return response.data;
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    },

    verifyPhone: async (data: VerificationData): Promise<{ success: boolean }> => {
        try {
            const response = await api.post<{ success: boolean }>('/auth/verify-phone', data);
            return response.data;
        } catch (error) {
            console.error('Phone verification error:', error);
            throw error;
        }
    },

    resendCode: async (data: ResendCodeData): Promise<{ success: boolean }> => {
        try {
            const response = await api.post<{ success: boolean }>('/auth/resend-code', data);
            return response.data;
        } catch (error) {
            console.error('Resend code error:', error);
            throw error;
        }
    },
}; 