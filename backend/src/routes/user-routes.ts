import { FastifyInstance } from 'fastify';
import {
    getUserProfileHandler,
    changePasswordHandler,
    updateProfileHandler,
    initiateEmailChangeHandler,
    initiatePhoneChangeHandler,
    initiatePasswordChangeHandler,
    verifyProfileChangeHandler,
    resendProfileChangeCodeHandler,
    sendEmailVerificationHandler,
    verifyEmailCodeHandler
} from '@controllers/user-controller';
import {
    UserProfileResponseSchema,
    ChangePasswordRequestSchema,
    ChangePasswordResponseSchema,
    UpdateProfileRequestSchema,
    UpdateProfileResponseSchema,
    InitiateEmailChangeRequestSchema,
    InitiatePhoneChangeRequestSchema,
    InitiatePasswordChangeRequestSchema,
    VerificationTokenResponseSchema,
    VerifyProfileChangeRequestSchema,
    ResendProfileChangeCodeRequestSchema,
    SuccessResponseSchema,
    EmailVerificationSendResponseSchema,
    EmailVerificationConfirmRequestSchema,
    EmailVerificationConfirmResponseSchema
} from '../schemas/user-schemas';
import { requireAuth } from '../middlewares/auth-middleware';
import { ErrorResponseSchema } from '../schemas/auth-schemas';

// Route definitions
export const userRoutes = async (fastify: FastifyInstance) => {
    // Get user profile
    fastify.get('/profile', {
        preHandler: [requireAuth],
        schema: {
            description: 'Obter dados do perfil do usuário logado',
            tags: ['users'],
            summary: 'Obter perfil do usuário',
            response: {
                200: UserProfileResponseSchema,
                401: ErrorResponseSchema,
                404: ErrorResponseSchema
            },
        },
    }, getUserProfileHandler);

    // Update user profile (non-sensitive fields)
    fastify.put('/profile', {
        schema: {
            description: 'Atualizar dados do perfil do usuário (campos não sensíveis)',
            tags: ['users'],
            summary: 'Atualizar perfil do usuário',
            body: UpdateProfileRequestSchema,
            response: {
                200: UpdateProfileResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
            },
        },
        preHandler: [requireAuth],
    }, updateProfileHandler);

    // Initiate email change
    fastify.post('/profile/email', {
        schema: {
            description: 'Iniciar processo de alteração de email',
            tags: ['users'],
            summary: 'Iniciar alteração de email',
            body: InitiateEmailChangeRequestSchema,
            response: {
                200: VerificationTokenResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
            },
        },
        preHandler: [requireAuth],
    }, initiateEmailChangeHandler);

    // Initiate phone change
    fastify.post('/profile/phone', {
        schema: {
            description: 'Iniciar processo de alteração de telefone',
            tags: ['users'],
            summary: 'Iniciar alteração de telefone',
            body: InitiatePhoneChangeRequestSchema,
            response: {
                200: VerificationTokenResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
            },
        },
        preHandler: [requireAuth],
    }, initiatePhoneChangeHandler);

    // Initiate password change (with verification)
    fastify.post('/profile/password/secure', {
        schema: {
            description: 'Iniciar processo de alteração de senha com verificação',
            tags: ['users'],
            summary: 'Iniciar alteração de senha segura',
            body: InitiatePasswordChangeRequestSchema,
            response: {
                200: VerificationTokenResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
            },
        },
        preHandler: [requireAuth],
    }, initiatePasswordChangeHandler);

    // Verify profile change
    fastify.post('/profile/verify', {
        schema: {
            description: 'Verificar e concluir alteração de perfil (email, telefone ou senha)',
            tags: ['users'],
            summary: 'Verificar alteração de perfil',
            body: VerifyProfileChangeRequestSchema,
            response: {
                200: SuccessResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
            },
        },
    }, verifyProfileChangeHandler);

    // Resend verification code
    fastify.post('/profile/resend-code', {
        schema: {
            description: 'Reenviar código de verificação para alteração de perfil',
            tags: ['users'],
            summary: 'Reenviar código de verificação',
            body: ResendProfileChangeCodeRequestSchema,
            response: {
                200: SuccessResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
            },
        },
    }, resendProfileChangeCodeHandler);

    // Change password (direct with old password)
    fastify.put('/change-password', {
        schema: {
            description: 'Alterar senha do usuário (requer senha atual)',
            tags: ['users'],
            summary: 'Alterar senha',
            body: ChangePasswordRequestSchema,
            response: {
                200: ChangePasswordResponseSchema,
                400: ErrorResponseSchema,
                401: ErrorResponseSchema,
            },
        },
        preHandler: [requireAuth],
    }, changePasswordHandler);

    // Email verification routes
    fastify.post('/verify-email/send', {
        schema: {
            tags: ['User'],
            description: 'Enviar código de verificação para o email do usuário autenticado',
            response: {
                200: EmailVerificationSendResponseSchema,
                400: ErrorResponseSchema,
            },
        },
        preHandler: [requireAuth],
        handler: sendEmailVerificationHandler
    });

    fastify.post('/verify-email/confirm', {
        schema: {
            tags: ['User'],
            description: 'Verificar código enviado para o email do usuário',
            body: EmailVerificationConfirmRequestSchema,
            response: {
                200: EmailVerificationConfirmResponseSchema,
                400: ErrorResponseSchema,
            },
        },
        preHandler: [requireAuth],
        handler: verifyEmailCodeHandler
    });
}; 