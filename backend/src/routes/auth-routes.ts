import { FastifyInstance } from 'fastify';
import {
    registerHandler,
    loginHandler,
    verifyEmailHandler,
    verifyPhoneHandler,
    resendCodeHandler
} from '@controllers/auth-controller';
import {
    RegisterRequestSchema,
    RegisterResponseSchema,
    LoginRequestSchema,
    LoginResponseSchema,
    ErrorResponseSchema,
    VerifyEmailRequestSchema,
    VerifyPhoneRequestSchema,
    VerificationResponseSchema,
    ResendCodeRequestSchema,
    ResendCodeResponseSchema
} from '../schemas/auth-schemas';

// Route definitions
export const authRoutes = async (fastify: FastifyInstance) => {
    // Start registration process
    fastify.post('/register', {
        schema: {
            tags: ['Authentication'],
            description: 'Inicia o processo de registro com envio de código de verificação para o telefone',
            body: RegisterRequestSchema,
            response: {
                200: RegisterResponseSchema,
                400: ErrorResponseSchema,
            },
        },
        handler: registerHandler
    });

    // Verify email code during registration
    fastify.post('/verify-email', {
        schema: {
            tags: ['Authentication'],
            description: 'Verifica o código enviado para o email durante o processo de registro inicial (opcional)',
            body: VerifyEmailRequestSchema,
            response: {
                200: VerificationResponseSchema,
                400: ErrorResponseSchema,
            },
        },
        handler: verifyEmailHandler
    });

    // Verify phone code
    fastify.post('/verify-phone', {
        schema: {
            tags: ['Authentication'],
            description: 'Verifica o código enviado para o telefone e completa o cadastro automaticamente',
            body: VerifyPhoneRequestSchema,
            response: {
                200: VerificationResponseSchema,
                400: ErrorResponseSchema,
            },
        },
        handler: verifyPhoneHandler
    });

    // Resend verification codes
    fastify.post('/resend-code', {
        schema: {
            tags: ['Authentication'],
            description: 'Reenvia códigos de verificação para email, telefone ou ambos',
            body: ResendCodeRequestSchema,
            response: {
                200: ResendCodeResponseSchema,
                400: ErrorResponseSchema,
            },
        },
        handler: resendCodeHandler
    });

    // Login
    fastify.post('/login', {
        schema: {
            tags: ['Authentication'],
            description: 'Autentica o usuário e retorna um token JWT',
            body: LoginRequestSchema,
            response: {
                200: LoginResponseSchema,
                401: ErrorResponseSchema,
            },
        },
        handler: loginHandler
    });
}; 