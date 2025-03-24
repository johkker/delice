import { FastifyRequest, FastifyReply } from 'fastify';
import {
    getUserProfile,
    changePassword,
    updateProfile,
    initiateEmailChange,
    initiatePhoneChange,
    initiatePasswordChange,
    verifyProfileChange,
    isProfileChangeTokenValid,
    resendProfileChangeCode
} from '@services/user-service';

// Get user profile handler
export const getUserProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request.user as any).id;
        const user = await getUserProfile(userId);

        if (!user) {
            return reply.status(404).send({
                success: false,
                error: {
                    message: 'Usuário não encontrado',
                },
            });
        }

        return {
            success: true,
            data: user,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Update user profile handler (non-sensitive fields)
export const updateProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request.user as any).id;
        const profileData = request.body as any;

        const updatedUser = await updateProfile(userId, profileData);

        return {
            success: true,
            message: 'Perfil atualizado com sucesso',
            data: updatedUser,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o perfil';
        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Initiate email change handler
export const initiateEmailChangeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request.user as any).id;
        const { newEmail, currentPassword } = request.body as { newEmail: string; currentPassword: string };

        const token = await initiateEmailChange(userId, newEmail, currentPassword);

        return {
            success: true,
            data: {
                token,
                expiresIn: 10, // 10 minutes
                message: 'Um código de verificação foi enviado para o novo email'
            }
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro ao iniciar a alteração de email';
        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Initiate phone change handler
export const initiatePhoneChangeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request.user as any).id;
        const { newPhone, currentPassword } = request.body as { newPhone: string; currentPassword: string };

        const token = await initiatePhoneChange(userId, newPhone, currentPassword);

        return {
            success: true,
            data: {
                token,
                expiresIn: 10, // 10 minutes
                message: 'Um código de verificação foi enviado para o novo telefone'
            }
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro ao iniciar a alteração de telefone';
        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Initiate password change handler (with verification)
export const initiatePasswordChangeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request.user as any).id;
        const { newPassword } = request.body as { newPassword: string };

        const token = await initiatePasswordChange(userId, newPassword);

        return {
            success: true,
            data: {
                token,
                expiresIn: 10, // 10 minutes
                message: 'Um código de verificação foi enviado para seu email'
            }
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro ao iniciar a alteração de senha';
        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Verify profile change handler
export const verifyProfileChangeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { token, code } = request.body as { token: string; code: string };

        // Check if token is valid
        const isTokenValid = await isProfileChangeTokenValid(token);
        if (!isTokenValid) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Token de verificação expirado ou inválido',
                },
            });
        }

        // Verify and complete the change
        await verifyProfileChange(token, code);

        return {
            success: true,
            message: 'Alteração verificada e concluída com sucesso',
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro durante a verificação';
        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Resend verification code handler
export const resendProfileChangeCodeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { token } = request.body as { token: string };

        // Check if token is valid
        const isTokenValid = await isProfileChangeTokenValid(token);
        if (!isTokenValid) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Token de verificação expirado ou inválido',
                },
            });
        }

        // Resend verification code
        await resendProfileChangeCode(token);

        return {
            success: true,
            message: 'Código de verificação reenviado com sucesso',
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro ao reenviar o código de verificação';
        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Change password handler (direct change with old password)
export const changePasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userId = (request.user as any).id;
        const { oldPassword, newPassword } = request.body as any;

        await changePassword(userId, oldPassword, newPassword);

        return {
            success: true,
            message: 'Senha alterada com sucesso',
        };
    } catch (error) {
        const originalMessage = error instanceof Error ? error.message : 'Ocorreu um erro';
        let message = originalMessage;

        // Translate common error messages
        if (originalMessage === 'User not found') {
            message = 'Usuário não encontrado';
        } else if (originalMessage === 'Current password is incorrect') {
            message = 'A senha atual está incorreta';
        }

        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
}; 