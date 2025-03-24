import { Type } from '@sinclair/typebox';

// Shared schemas
export const UserResponseSchema = Type.Object({
    id: Type.String(),
    name: Type.String(),
    email: Type.String(),
    phone: Type.String(),
    document: Type.String(),
    roles: Type.Array(Type.String()),
});

export const ErrorResponseSchema = Type.Object({
    success: Type.Boolean(),
    error: Type.Object({
        message: Type.String(),
    }),
});

// Register endpoint schemas
export const RegisterRequestSchema = Type.Object({
    name: Type.String({ description: 'Nome completo do usuário' }),
    email: Type.String({ format: 'email', description: 'Endereço de email do usuário' }),
    password: Type.String({ minLength: 6, description: 'Senha do usuário (mín. 6 caracteres)' }),
    phone: Type.String({ description: 'Número de telefone do usuário' }),
    document: Type.String({ description: 'CPF ou CNPJ do usuário' }),
});

export const RegisterResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: Type.Object({
        token: Type.String({ description: 'Token para verificação do cadastro' }),
        expiresIn: Type.Number({ description: 'Tempo de expiração em minutos' }),
        message: Type.String({ description: 'Mensagem informativa sobre o processo de verificação' }),
    }),
});

// Verification schemas
export const VerifyEmailRequestSchema = Type.Object({
    token: Type.String({ description: 'Token de verificação fornecido no início do cadastro' }),
    code: Type.String({ description: 'Código de verificação enviado para o email' }),
});

export const VerifyPhoneRequestSchema = Type.Object({
    token: Type.String({ description: 'Token de verificação fornecido no início do cadastro' }),
    code: Type.String({ description: 'Código de verificação enviado para o telefone' }),
});

// Enhanced verification response schema that can include user data after phone verification
export const VerificationResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    emailVerified: Type.Optional(Type.Boolean()),
    phoneVerified: Type.Optional(Type.Boolean()),
    // Optional user and token fields that are present after successful phone verification
    user: Type.Optional(UserResponseSchema),
    token: Type.Optional(Type.String({ description: 'JWT de autenticação (apenas após verificação do telefone)' })),
});

export const ResendCodeRequestSchema = Type.Object({
    token: Type.String({ description: 'Token de verificação fornecido no início do cadastro' }),
    type: Type.Enum({ email: 'email', phone: 'phone', both: 'both' }, { description: 'Tipo de código a reenviar' }),
});

export const ResendCodeResponseSchema = Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
});

// Login endpoint schemas
export const LoginRequestSchema = Type.Object({
    email: Type.String({ format: 'email', description: 'Endereço de email do usuário' }),
    password: Type.String({ description: 'Senha do usuário' }),
});

export const LoginResponseSchema = Type.Object({
    success: Type.Boolean(),
    data: Type.Object({
        user: UserResponseSchema,
        token: Type.String(),
    }),
}); 