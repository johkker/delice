import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateUser, registerUser } from '@services/user-service';
import {
    startVerification,
    verifyEmailCode,
    verifyPhoneCode,
    isRegistrationVerified,
    getVerifiedRegistration,
    resendVerificationCodes,
    isValidToken,
    isVerificationCompleted
} from '@services/verification-service';

// Start registration process handler
export const registerUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        console.log("request.body", request.body)
        const userData = request.body as any;

        // Start verification process instead of immediate registration
        const verificationToken = await startVerification(userData);

        return {
            success: true,
            data: {
                token: verificationToken,
                expiresIn: 10, // 10 minutes expiration
                message: "Códigos de verificação enviados. Verifique seu telefone para completar o cadastro e seu email para confirmar seu endereço de email."
            },
        };
    } catch (error) {
        const originalMessage = error instanceof Error ? error.message : 'Ocorreu um erro';
        let message = originalMessage;

        // Translate common error messages
        if (originalMessage === 'User with this email already exists') {
            message = 'Este email já está sendo usado por outro usuário';
        }

        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Verify email code handler
export const verifyEmailHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { token, code } = request.body as { token: string; code: string };

        // Check if token is valid
        const isTokenValid = await isValidToken(token);
        if (!isTokenValid) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Token de verificação expirado ou inválido',
                },
            });
        }

        // Check if email is already verified
        const isEmailAlreadyVerified = await isVerificationCompleted(token, 'email');
        if (isEmailAlreadyVerified) {
            return {
                success: true,
                message: 'Email já verificado',
                emailVerified: true,
                phoneVerified: await isVerificationCompleted(token, 'phone')
            };
        }

        // Verify email code
        const isEmailVerified = await verifyEmailCode(token, code);

        if (!isEmailVerified) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Código de verificação do email inválido',
                },
            });
        }

        // Email verification is successful
        return {
            success: true,
            message: 'Email verificado com sucesso',
            emailVerified: true,
            phoneVerified: await isVerificationCompleted(token, 'phone')
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

// Verify phone code handler
export const verifyPhoneHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { token, code } = request.body as { token: string; code: string };

        // Check if token is valid
        const isTokenValid = await isValidToken(token);
        if (!isTokenValid) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Token de verificação expirado ou inválido',
                },
            });
        }

        // Check if phone is already verified
        const isPhoneAlreadyVerified = await isVerificationCompleted(token, 'phone');
        if (isPhoneAlreadyVerified) {
            return {
                success: true,
                message: 'Telefone já verificado',
                phoneVerified: true,
                emailVerified: await isVerificationCompleted(token, 'email')
            };
        }

        // Verify phone code
        const isPhoneVerified = await verifyPhoneCode(token, code);

        if (!isPhoneVerified) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Código de verificação do telefone inválido',
                },
            });
        }

        // Phone verification is successful - auto-register the user
        const userData = await getVerifiedRegistration(token);

        if (!userData) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Dados de cadastro não encontrados ou já utilizados',
                },
            });
        }

        // Complete the registration process
        const result = await registerUser(userData);

        return {
            success: true,
            message: 'Telefone verificado com sucesso. Cadastro realizado!',
            phoneVerified: true,
            emailVerified: await isVerificationCompleted(token, 'email'),
            user: result.user,
            token: result.token
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

// Resend verification codes handler
export const resendCodeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const { token, type } = request.body as { token: string; type: 'email' | 'phone' | 'both' };

        // Check if token is valid
        const isTokenValid = await isValidToken(token);
        if (!isTokenValid) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Token de verificação expirado ou inválido',
                },
            });
        }

        // Check if the specified verification(s) are already completed
        if (type === 'email' || type === 'both') {
            const isEmailVerified = await isVerificationCompleted(token, 'email');
            if (isEmailVerified && type === 'email') {
                return {
                    success: true,
                    message: 'Email já verificado',
                };
            }
        }

        if (type === 'phone' || type === 'both') {
            const isPhoneVerified = await isVerificationCompleted(token, 'phone');
            if (isPhoneVerified && type === 'phone') {
                return {
                    success: true,
                    message: 'Telefone já verificado',
                };
            }
        }

        // Resend only codes that aren't verified yet
        const success = await resendVerificationCodes(token, type);

        if (!success) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Não foi possível reenviar os códigos de verificação',
                },
            });
        }

        const typeText = type === 'email' ? 'email' : type === 'phone' ? 'telefone' : 'email e telefone';

        return {
            success: true,
            message: `Códigos de verificação reenviados para ${typeText}`,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro ao reenviar os códigos';

        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
};

// Login handler
export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = request.body as any;
        const result = await authenticateUser(data);

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        const originalMessage = error instanceof Error ? error.message : 'Ocorreu um erro';
        let message = originalMessage;

        // Translate common error messages
        if (originalMessage === 'Invalid email or password') {
            message = 'Email ou senha incorretos';
        }

        return reply.status(401).send({
            success: false,
            error: {
                message,
            },
        });
    }
}; 