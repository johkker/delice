import crypto from 'crypto';
import { RegisterUserData } from './user-service';
import { sendEmail } from './email-service';
import { sendVerificationSMS } from '@utils/sms-service';
import { setCacheData, getCacheData, deleteCacheData } from './cache-service';

// Store pending registrations with verification codes
// Now stored in Redis instead of in-memory
interface PendingRegistration {
    userData: RegisterUserData;
    emailCode: string;
    phoneCode: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    createdAt: string; // ISO string date format for JSON compatibility
}

// Prefix for Redis keys to avoid conflicts with other data
const REDIS_PREFIX = 'verification:';

// 10-minute expiration time in seconds
const EXPIRATION_TIME = 10 * 60;

// Generate a random verification code
const generateVerificationCode = (length = 6): string => {
    return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
};

// Generate a unique token for the registration
const generateRegistrationToken = (): string => {
    return crypto.randomUUID();
};

// Start the registration verification process
export const startVerification = async (validatedData: RegisterUserData): Promise<string> => {
    // Generate verification code for phone only
    const phoneCode = generateVerificationCode();

    // Generate a token for this registration
    const token = generateRegistrationToken();

    // Store the pending registration in Redis
    const pendingRegistration: PendingRegistration = {
        userData: validatedData,
        emailCode: '', // No email code generated at registration time
        phoneCode,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date().toISOString()
    };

    // Set in Redis with 10-minute expiration
    await setCacheData(`${REDIS_PREFIX}${token}`, pendingRegistration, EXPIRATION_TIME);

    // In development mode, log the verification codes instead of sending SMS
    if (process.env.NODE_ENV === 'development') {
        console.log('\n=== REGISTRATION VERIFICATION CODES (DEVELOPMENT MODE) ===');
        console.log(`User: ${validatedData.name} (${validatedData.email})`);
        console.log(`Phone: ${validatedData.phone}`);
        console.log(`Token: ${token}`);
        console.log(`Phone Code: ${phoneCode}`);
        console.log('====================================================\n');
    } else {
        // In production, send actual verification messages
        // Send verification SMS only
        await sendVerificationSMS(validatedData.phone, phoneCode, validatedData.name);
    }

    return token;
};

// Send verification email
const sendVerificationEmail = async (email: string, name: string, code: string): Promise<boolean> => {
    const htmlContent = `
    <html>
      <body>
        <h1>Verificação de Email - Delice</h1>
        <p>Olá ${name},</p>
        <p>Para completar seu cadastro na Delice, utilize o código de verificação abaixo:</p>
        <div style="padding: 10px; background-color: #f5f5f5; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>Este código expirará em 10 minutos.</p>
        <p>Se você não solicitou este cadastro, por favor ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Delice</p>
      </body>
    </html>
  `;

    return await sendEmail(
        { email, name },
        {
            subject: 'Código de Verificação - Delice',
            htmlContent,
        }
    );
};

// Verify email code
export const verifyEmailCode = async (token: string, code: string): Promise<boolean> => {
    const registration = await getCacheData<PendingRegistration>(`${REDIS_PREFIX}${token}`);

    if (!registration) {
        return false; // Registration not found
    }

    // Check if code matches and update verification status
    if (registration.emailCode === code) {
        registration.emailVerified = true;

        // Update in Redis, maintaining the same expiration
        await setCacheData(`${REDIS_PREFIX}${token}`, registration, EXPIRATION_TIME);
        return true;
    }

    return false;
};

// Verify phone code
export const verifyPhoneCode = async (token: string, code: string): Promise<boolean> => {
    const registration = await getCacheData<PendingRegistration>(`${REDIS_PREFIX}${token}`);

    if (!registration) {
        return false; // Registration not found
    }

    // Check if code matches and update verification status
    if (registration.phoneCode === code) {
        registration.phoneVerified = true;

        // Update in Redis, maintaining the same expiration
        await setCacheData(`${REDIS_PREFIX}${token}`, registration, EXPIRATION_TIME);
        return true;
    }

    return false;
};

// Check if registration is ready for completion (phone verification is required)
export const isRegistrationVerified = async (token: string): Promise<boolean> => {
    const registration = await getCacheData<PendingRegistration>(`${REDIS_PREFIX}${token}`);

    if (!registration) {
        return false;
    }

    // Phone verification is required for registration
    return registration.phoneVerified;
};

// Check if a specific verification type is already completed
export const isVerificationCompleted = async (
    token: string,
    verificationType: 'email' | 'phone'
): Promise<boolean> => {
    const registration = await getCacheData<PendingRegistration>(`${REDIS_PREFIX}${token}`);

    if (!registration) {
        return false;
    }

    return verificationType === 'email'
        ? registration.emailVerified
        : registration.phoneVerified;
};

// Get registration data if verified
export const getVerifiedRegistration = async (token: string): Promise<RegisterUserData | null> => {
    const registration = await getCacheData<PendingRegistration>(`${REDIS_PREFIX}${token}`);

    if (!registration) {
        return null;
    }

    const verified = await isRegistrationVerified(token);
    if (!verified) {
        return null;
    }

    // Remove this registration once retrieved
    await deleteCacheData(`${REDIS_PREFIX}${token}`);

    return registration.userData;
};

// Resend verification codes if needed
export const resendVerificationCodes = async (token: string, type: 'email' | 'phone' | 'both'): Promise<boolean> => {
    const registration = await getCacheData<PendingRegistration>(`${REDIS_PREFIX}${token}`);

    if (!registration) {
        return false;
    }

    // Reset verification status and generate new codes
    if (type === 'email' || type === 'both') {
        registration.emailCode = generateVerificationCode();
        registration.emailVerified = false;
        await sendVerificationEmail(
            registration.userData.email,
            registration.userData.name,
            registration.emailCode
        );
    }

    if (type === 'phone' || type === 'both') {
        registration.phoneCode = generateVerificationCode();
        registration.phoneVerified = false;
        // Send SMS with the new code
        await sendVerificationSMS(
            registration.userData.phone,
            registration.phoneCode,
            registration.userData.name
        );
    }

    // Update registration with new codes in Redis
    await setCacheData(`${REDIS_PREFIX}${token}`, registration, EXPIRATION_TIME);

    return true;
};

// Helper function to check if a registration token exists and is not expired
export const isValidToken = async (token: string): Promise<boolean> => {
    // If the token exists in Redis, it's valid (Redis handles expiration)
    const registration = await getCacheData<PendingRegistration>(`${REDIS_PREFIX}${token}`);
    return registration !== null;
}; 