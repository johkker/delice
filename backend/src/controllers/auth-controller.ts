import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateUser, registerUser, validateRegistrationData, sendEmailVerificationCode, RegisterUserData } from '@services/user-service';
import {
    startVerification,
    verifyEmailCode,
    verifyPhoneCode,
    getVerifiedRegistration,
    resendVerificationCodes,
    isValidToken,
    isVerificationCompleted,
    isRegistrationVerified
} from '@services/verification-service';

// Register handler
export const registerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const userData = request.body as RegisterUserData;

        // Validate registration data
        const validatedData = await validateRegistrationData(userData);

        // Start verification process for phone only
        const token = await startVerification(validatedData);

        return {
            success: true,
            data: {
                token,
                expiresIn: 10, // 10 minutes
                message: 'Código de verificação enviado para seu telefone. Verifique seu telefone para completar o cadastro.'
            }
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
        return reply.status(400).send({
            success: false,
            error: {
                message
            }
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
                    message: 'Código de verificação de email inválido',
                },
            });
        }

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

        // Check if the token is valid
        if (!(await isValidToken(token))) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Token de verificação expirado ou inválido'
                }
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

        // Verify the phone code
        const verified = await verifyPhoneCode(token, code);
        if (!verified) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'Código de verificação do telefone inválido'
                }
            });
        }

        // Check if registration is ready for completion (phone verification is now complete)
        const isRegistrationReady = await isRegistrationVerified(token);
        if (isRegistrationReady) {
            // Get verified registration data
            const userData = await getVerifiedRegistration(token);
            if (!userData) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        message: 'Dados de registro inválidos ou expirados'
                    }
                });
            }

            // Register the user
            const isEmailVerified = await isVerificationCompleted(token, 'email');
            const authResponse = await registerUser({
                ...userData,
                phone_verified: true, // Phone is verified since we're here
                email_verified: isEmailVerified // Email may or may not be verified
            });

            // Send email verification code if email is not verified yet
            if (!isEmailVerified) {
                try {
                    await sendEmailVerificationCode(authResponse.user.id);
                } catch (error) {
                    // Log error but don't fail the registration
                    console.error('Error sending email verification code:', error);
                }
            }

            return {
                success: true,
                message: 'Telefone verificado com sucesso. Cadastro realizado!',
                phoneVerified: true,
                emailVerified: isEmailVerified,
                user: authResponse.user,
                token: authResponse.token
            };
        }

        // If we get here, phone verification was successful but something else went wrong
        return {
            success: true,
            message: 'Telefone verificado com sucesso',
            phoneVerified: true,
            emailVerified: await isVerificationCompleted(token, 'email')
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro durante a verificação';
        return reply.status(400).send({
            success: false,
            error: {
                message
            }
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