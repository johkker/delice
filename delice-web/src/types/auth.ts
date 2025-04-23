export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    emailVerified: boolean;
    phoneVerified: boolean;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone: string;
    document: string;
}

export interface VerificationData {
    token: string;
    code: string;
}

export interface AuthResponse {
    token: string;
    user: User;
} 