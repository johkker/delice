import { Type } from '@sinclair/typebox';

// User profile schema
export const UserProfileSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    email: Type.String(),
    avatar_url: Type.Union([Type.String(), Type.Null()]),
    phone: Type.String(),
    document: Type.String(),
    roles: Type.Array(Type.String()),
    rating: Type.Number(),
    rating_count: Type.Number(),
    created_at: Type.String(),
    updated_at: Type.String(),
});

export const UserProfileSchemaWithVerification = Type.Object({
    ...UserProfileSchema.properties,
    email_verified: Type.Boolean(),
    phone_verified: Type.Boolean(),
});

export const UserProfileResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: UserProfileSchemaWithVerification,
});

// Update profile schema
export const UpdateProfileRequestSchema = Type.Object({
    name: Type.Optional(Type.String({ description: 'Nome completo do usuário' })),
    avatar_url: Type.Optional(Type.Union([Type.String({ description: 'URL da imagem de perfil' }), Type.Null()])),
});

export const UpdateProfileResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: UserProfileSchema,
});

// Initiate email change schema
export const InitiateEmailChangeRequestSchema = Type.Object({
    newEmail: Type.String({ format: 'email', description: 'Novo endereço de email' }),
    currentPassword: Type.String({ minLength: 6, description: 'Senha atual para confirmar a alteração' }),
});

// Initiate phone change schema
export const InitiatePhoneChangeRequestSchema = Type.Object({
    newPhone: Type.String({ description: 'Novo número de telefone' }),
    currentPassword: Type.String({ minLength: 6, description: 'Senha atual para confirmar a alteração' }),
});

// Initiate password change schema
export const InitiatePasswordChangeRequestSchema = Type.Object({
    newPassword: Type.String({ minLength: 6, description: 'Nova senha (mín. 6 caracteres)' }),
});

// Verification token response schema
export const VerificationTokenResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: Type.Object({
        token: Type.String({ description: 'Token para verificação da alteração' }),
        expiresIn: Type.Number({ description: 'Tempo de expiração em minutos' }),
        message: Type.String({ description: 'Mensagem informativa' }),
    }),
});

// Verify code schema
export const VerifyProfileChangeRequestSchema = Type.Object({
    token: Type.String({ description: 'Token de verificação recebido ao iniciar a alteração' }),
    code: Type.String({ description: 'Código de verificação recebido por email ou SMS' }),
});

// Resend code schema
export const ResendProfileChangeCodeRequestSchema = Type.Object({
    token: Type.String({ description: 'Token de verificação recebido ao iniciar a alteração' }),
});

// Generic success response
export const SuccessResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

// Change password schemas (direct change with old password)
export const ChangePasswordRequestSchema = Type.Object({
    oldPassword: Type.String({ description: 'Senha atual' }),
    newPassword: Type.String({ minLength: 6, description: 'Nova senha (mín. 6 caracteres)' }),
});

export const ChangePasswordResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

// Email verification schemas
export const EmailVerificationSendResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String({ description: 'Mensagem informativa' }),
    expiresIn: Type.Number({ description: 'Tempo de expiração em minutos' })
});

export const EmailVerificationConfirmRequestSchema = Type.Object({
    code: Type.String({ description: 'Código de verificação recebido por email' }),
});

export const EmailVerificationConfirmResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
}); 