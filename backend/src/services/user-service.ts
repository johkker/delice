import { createUser, findUserByEmail, findUserById, findUserByDocument, findUserByPhone, updateUser, updateUserProfile } from '@repositories/user-repository';
import { User, UserRole } from '@entities/User';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { config } from 'dotenv';
import { sendWelcomeEmail, createUserContact } from './email-service';
import {
    UpdateUserProfileData
} from '@repositories/user-repository';

import {
    startEmailChangeVerification,
    startPhoneChangeVerification,
    startPasswordChangeVerification,
    verifyAndCompleteChange,
    isValidVerificationToken,
    resendVerificationCode
} from './profile-verification-service';

config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';
const SALT_ROUNDS = 10;

// Types
export type AuthUserData = {
    email: string;
    password: string;
};

export type RegisterUserData = {
    name: string;
    email: string;
    password: string;
    phone: string;
    document: string;
    roles?: UserRole[];
};

export type AuthResponse = {
    user: Omit<User, 'password'>;
    token: string;
};

// Helpers
const generateUserToken = (user: User): string => {
    return sign(
        {
            id: user.id,
            email: user.email,
            roles: user.roles,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );
};

const sanitizeUser = (user: User): Omit<User, 'password'> => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// Service functions
export const registerUser = async (data: RegisterUserData): Promise<AuthResponse> => {
    // Required fields validation
    if (!data.name || !data.email || !data.password || !data.phone || !data.document) {
        throw new Error('Todos os campos (nome, email, senha, telefone e documento) são obrigatórios');
    }

    // Email uniqueness validation
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
        throw new Error('Este email já está sendo usado por outro usuário');
    }

    // Phone uniqueness validation
    const existingPhone = await findUserByPhone(data.phone);
    if (existingPhone) {
        throw new Error('Este telefone já está sendo usado por outro usuário');
    }

    // Document validation and uniqueness check
    const formattedDocument = User.validateAndFormatDocument(data.document);
    if (!formattedDocument) {
        throw new Error('Documento inválido. Informe um CPF ou CNPJ válido.');
    }

    const existingDocument = await findUserByDocument(formattedDocument);
    if (existingDocument) {
        throw new Error('Este documento já está sendo usado por outro usuário');
    }

    const hashedPassword = await hash(data.password, SALT_ROUNDS);

    const newUser = await createUser({
        ...data,
        document: formattedDocument,
        password: hashedPassword,
    });

    const token = generateUserToken(newUser);

    // Send welcome email and create contact in Brevo (non-blocking)
    // We handle this in a way that doesn't block or fail the registration process
    try {
        // Start both operations in parallel
        const emailPromises = [
            sendWelcomeEmail(newUser.email, newUser.name),
            createUserContact(newUser.email, newUser.name, newUser.phone, newUser.document)
        ];

        // Wait for both to complete
        await Promise.all(emailPromises);
        console.log(`Email sent and contact created successfully for ${newUser.email}`);
    } catch (error) {
        // Log the error but don't fail the registration
        console.error('Error during email operations:', error);
        // We don't rethrow the error because we don't want to fail the registration
    }

    return {
        user: sanitizeUser(newUser),
        token,
    };
};

export const authenticateUser = async (data: AuthUserData): Promise<AuthResponse> => {
    const user = await findUserByEmail(data.email);

    if (!user) {
        throw new Error('Email ou senha incorretos');
    }

    const passwordMatches = await compare(data.password, user.password);

    if (!passwordMatches) {
        throw new Error('Email ou senha incorretos');
    }

    const token = generateUserToken(user);

    return {
        user: sanitizeUser(user),
        token,
    };
};

export const getUserProfile = async (userId: string): Promise<Omit<User, 'password'> | null> => {
    const user = await findUserById(userId);

    if (!user) {
        return null;
    }

    return sanitizeUser(user);
};

export const changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
): Promise<boolean> => {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    const passwordMatches = await compare(oldPassword, user.password);

    if (!passwordMatches) {
        throw new Error('A senha atual está incorreta');
    }

    const hashedPassword = await hash(newPassword, SALT_ROUNDS);

    await updateUser(userId, {
        password: hashedPassword,
    } as any); // TypeScript workaround since we excluded password from UpdateUserData

    return true;
};

// Update user profile (non-sensitive fields like name and avatar)
export const updateProfile = async (
    userId: string,
    data: UpdateUserProfileData
): Promise<Omit<User, 'password'> | null> => {
    const updatedUser = await updateUserProfile(userId, data);

    if (!updatedUser) {
        throw new Error('Usuário não encontrado');
    }

    return sanitizeUser(updatedUser);
};

// Initiate email change (requires verification)
export const initiateEmailChange = async (
    userId: string,
    newEmail: string,
    currentPassword: string
): Promise<string> => {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    if (user.email === newEmail) {
        throw new Error('O novo email é igual ao atual');
    }

    // Verify the current password
    const passwordMatches = await compare(currentPassword, user.password);
    if (!passwordMatches) {
        throw new Error('A senha atual está incorreta');
    }

    // Check if the new email is already in use
    const existingUserWithEmail = await findUserByEmail(newEmail);
    if (existingUserWithEmail) {
        throw new Error('Este email já está em uso por outro usuário');
    }

    // Start email change verification
    return await startEmailChangeVerification(userId, user.email, newEmail);
};

// Initiate phone change (requires verification)
export const initiatePhoneChange = async (
    userId: string,
    newPhone: string,
    currentPassword: string
): Promise<string> => {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    if (user.phone === newPhone) {
        throw new Error('O novo telefone é igual ao atual');
    }

    // Verify the current password
    const passwordMatches = await compare(currentPassword, user.password);
    if (!passwordMatches) {
        throw new Error('A senha atual está incorreta');
    }

    // Check if the new phone is already in use
    const existingUserWithPhone = await findUserByPhone(newPhone);
    if (existingUserWithPhone) {
        throw new Error('Este telefone já está em uso por outro usuário');
    }

    // Start phone change verification
    return await startPhoneChangeVerification(userId, newPhone);
};

// Initiate password change with verification (no need for old password)
export const initiatePasswordChange = async (
    userId: string,
    newPassword: string
): Promise<string> => {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    // Start password change verification
    return await startPasswordChangeVerification(userId, user.email, newPassword);
};

// Verify and complete a profile change
export const verifyProfileChange = async (
    token: string,
    code: string
): Promise<boolean> => {
    return await verifyAndCompleteChange(token, code);
};

// Check if a profile change verification token is valid
export const isProfileChangeTokenValid = async (token: string): Promise<boolean> => {
    return await isValidVerificationToken(token);
};

// Resend a profile change verification code
export const resendProfileChangeCode = async (token: string): Promise<boolean> => {
    return await resendVerificationCode(token);
}; 