import crypto from 'crypto';
import { setCacheData, getCacheData, deleteCacheData } from './cache-service';
import { sendEmail } from './email-service';
import { sendVerificationSMS } from '@utils/sms-service';
import { hash } from 'bcrypt';
import {
    updateUserEmail,
    updateUserPhone,
    updateUserPassword,
    findUserById
} from '@repositories/user-repository';

// Types for profile updates that require verification
interface EmailChangeRequest {
    userId: string;
    newEmail: string;
}

interface PhoneChangeRequest {
    userId: string;
    newPhone: string;
}

interface PasswordChangeRequest {
    userId: string;
    newPassword: string;
}

// Union type for all verification types
type VerificationRequest = EmailChangeRequest | PhoneChangeRequest | PasswordChangeRequest;

// Type guards to check the type of verification request
const isEmailChange = (req: VerificationRequest): req is EmailChangeRequest =>
    'newEmail' in req;

const isPhoneChange = (req: VerificationRequest): req is PhoneChangeRequest =>
    'newPhone' in req;

const isPasswordChange = (req: VerificationRequest): req is PasswordChangeRequest =>
    'newPassword' in req;

// Prefix for Redis keys to avoid conflicts with other data
const REDIS_PREFIX = 'profile-update:';

// 10-minute expiration time in seconds
const EXPIRATION_TIME = 10 * 60;

// Generate a random verification code
const generateVerificationCode = (length = 6): string => {
    return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
};

// Generate a unique token for the verification
const generateVerificationToken = (): string => {
    return crypto.randomUUID();
};

// Start email change verification process
export const startEmailChangeVerification = async (
    userId: string,
    currentEmail: string,
    newEmail: string
): Promise<string> => {
    // Generate verification code
    const code = generateVerificationCode();

    // Generate a token for this verification
    const token = generateVerificationToken();

    // Store the request in Redis
    const request: EmailChangeRequest = {
        userId,
        newEmail
    };

    await setCacheData(
        `${REDIS_PREFIX}${token}`,
        { code, request, type: 'email' },
        EXPIRATION_TIME
    );

    // Send verification email to the NEW email
    await sendEmailChangeVerification(newEmail, code);

    return token;
};

// Send email change verification email
const sendEmailChangeVerification = async (
    email: string,
    code: string
): Promise<boolean> => {
    const htmlContent = `
    <html>
      <body>
        <h1>Verificação de Mudança de Email - Delice</h1>
        <p>Você solicitou a alteração do seu email cadastrado na Delice.</p>
        <p>Para confirmar esta alteração, utilize o código de verificação abaixo:</p>
        <div style="padding: 10px; background-color: #f5f5f5; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>Este código expirará em 10 minutos.</p>
        <p>Se você não solicitou esta alteração, por favor ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Delice</p>
      </body>
    </html>
  `;

    return await sendEmail(
        { email, name: '' },
        {
            subject: 'Verificação de Mudança de Email - Delice',
            htmlContent,
        }
    );
};

// Start phone change verification process
export const startPhoneChangeVerification = async (
    userId: string,
    newPhone: string
): Promise<string> => {
    // Generate verification code
    const code = generateVerificationCode();

    // Generate a token for this verification
    const token = generateVerificationToken();

    // Store the request in Redis
    const request: PhoneChangeRequest = {
        userId,
        newPhone
    };

    await setCacheData(
        `${REDIS_PREFIX}${token}`,
        { code, request, type: 'phone' },
        EXPIRATION_TIME
    );

    // Send verification SMS to the NEW phone
    await sendVerificationSMS(newPhone, code);

    return token;
};

// Start password change verification process
export const startPasswordChangeVerification = async (
    userId: string,
    userEmail: string,
    newPassword: string
): Promise<string> => {
    // Generate verification code
    const code = generateVerificationCode();

    // Generate a token for this verification
    const token = generateVerificationToken();

    // Store the request in Redis
    const request: PasswordChangeRequest = {
        userId,
        newPassword
    };

    await setCacheData(
        `${REDIS_PREFIX}${token}`,
        { code, request, type: 'password' },
        EXPIRATION_TIME
    );

    // Send verification email for password change
    await sendPasswordChangeVerification(userEmail, code);

    return token;
};

// Send password change verification email
const sendPasswordChangeVerification = async (
    email: string,
    code: string
): Promise<boolean> => {
    const htmlContent = `
    <html>
      <body>
        <h1>Verificação de Alteração de Senha - Delice</h1>
        <p>Você solicitou a alteração da sua senha na Delice.</p>
        <p>Para confirmar esta alteração, utilize o código de verificação abaixo:</p>
        <div style="padding: 10px; background-color: #f5f5f5; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>Este código expirará em 10 minutos.</p>
        <p>Se você não solicitou esta alteração, por favor ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Delice</p>
      </body>
    </html>
  `;

    return await sendEmail(
        { email, name: '' },
        {
            subject: 'Verificação de Alteração de Senha - Delice',
            htmlContent,
        }
    );
};

// Verify a code and complete the requested change
export const verifyAndCompleteChange = async (
    token: string,
    code: string
): Promise<boolean> => {
    // Get the verification data from Redis
    const data = await getCacheData<{
        code: string;
        request: VerificationRequest;
        type: 'email' | 'phone' | 'password';
    }>(`${REDIS_PREFIX}${token}`);

    if (!data) {
        throw new Error('Token de verificação expirado ou inválido');
    }

    // Check if code matches
    if (data.code !== code) {
        throw new Error('Código de verificação inválido');
    }

    // Process the change based on the type
    if (isEmailChange(data.request)) {
        // Update the user's email
        const result = await updateUserEmail(data.request.userId, {
            email: data.request.newEmail
        });

        if (!result) {
            throw new Error('Usuário não encontrado');
        }
    } else if (isPhoneChange(data.request)) {
        // Update the user's phone
        const result = await updateUserPhone(data.request.userId, {
            phone: data.request.newPhone
        });

        if (!result) {
            throw new Error('Usuário não encontrado');
        }
    } else if (isPasswordChange(data.request)) {
        // Hash the new password
        const SALT_ROUNDS = 10;
        const hashedPassword = await hash(data.request.newPassword, SALT_ROUNDS);

        // Update the user's password
        const result = await updateUserPassword(data.request.userId, {
            password: hashedPassword
        });

        if (!result) {
            throw new Error('Usuário não encontrado');
        }
    }

    // Remove the verification data
    await deleteCacheData(`${REDIS_PREFIX}${token}`);

    return true;
};

// Check if a verification token is valid
export const isValidVerificationToken = async (token: string): Promise<boolean> => {
    const data = await getCacheData<{
        code: string;
        request: VerificationRequest;
        type: 'email' | 'phone' | 'password';
    }>(`${REDIS_PREFIX}${token}`);

    return data !== null;
};

// Resend verification code
export const resendVerificationCode = async (token: string): Promise<boolean> => {
    const data = await getCacheData<{
        code: string;
        request: VerificationRequest;
        type: 'email' | 'phone' | 'password';
    }>(`${REDIS_PREFIX}${token}`);

    if (!data) {
        throw new Error('Token de verificação expirado ou inválido');
    }

    // Generate a new code
    const newCode = generateVerificationCode();

    // Update the stored data with the new code
    await setCacheData(
        `${REDIS_PREFIX}${token}`,
        { ...data, code: newCode },
        EXPIRATION_TIME
    );

    // Send the new code based on the verification type
    if (data.type === 'email' && isEmailChange(data.request)) {
        await sendEmailChangeVerification(data.request.newEmail, newCode);
    } else if (data.type === 'phone' && isPhoneChange(data.request)) {
        await sendVerificationSMS(data.request.newPhone, newCode);
    } else if (data.type === 'password') {
        // For password changes, we need to get the user's email
        const user = await findUserById(data.request.userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        await sendPasswordChangeVerification(user.email, newCode);
    }

    return true;
}; 