export type UserRole = 'USER' | 'ADMIN' | 'STORE_OWNER';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    document: string;
    roles: UserRole[];
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone: string;
    document: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface VerificationData {
    token: string;
    code: string;
}

export interface ResendCodeData {
    token: string;
    type: 'email' | 'phone' | 'both';
} 