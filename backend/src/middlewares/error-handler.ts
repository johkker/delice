import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

// Extend FastifyError interface to include our custom properties
declare module 'fastify' {
    interface FastifyError {
        isEmailError?: boolean;
    }
}

interface CustomError extends Error {
    statusCode?: number;
    code?: string;
    validation?: any[];
    isEmailError?: boolean; // Flag for email-related errors
}

export const errorHandler = (
    error: FastifyError | CustomError,
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const statusCode = error.statusCode || 500;
    const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
    let message = error.message || 'Ops! Algo deu errado no servidor';

    // Handle email-related errors differently - log but don't fail request
    if (error.isEmailError) {
        request.log.error({
            error: 'EMAIL_ERROR',
            message: error.message,
            stack: error.stack,
        });
        // Don't send error response for email errors
        return;
    }

    // Translate common error messages
    if (message === 'Not Found') {
        message = 'Recurso não encontrado';
    } else if (message.includes('Authorization')) {
        message = 'Você precisa estar logado para acessar este recurso';
    } else if (message.includes('Unexpected token')) {
        message = 'Formato de dados inválido';
    } else if (message === 'An unexpected error occurred') {
        message = 'Ops! Algo deu errado no servidor';
    } else if (message.includes('Error sending email')) {
        // Handle email errors but don't expose details to users
        request.log.error({ errorDetail: error.message, stack: error.stack });
        message = 'Não foi possível enviar o email de boas-vindas, mas sua conta foi criada com sucesso';
    }

    // Handle validation errors
    if (error.validation && error.validation.length > 0) {
        const validationError = error.validation[0];
        const field = validationError.params?.property || '';
        const keyword = validationError.keyword || '';

        // Common validation messages
        if (keyword === 'required') {
            message = `O campo ${field} é obrigatório`;
        } else if (keyword === 'format') {
            message = `O campo ${field} está em formato inválido`;
        } else if (keyword === 'minLength') {
            message = `O campo ${field} é muito curto`;
        } else if (keyword === 'type') {
            message = `O campo ${field} tem tipo inválido`;
        } else {
            message = validationError.message || 'Dados inválidos enviados';
        }
    }

    request.log.error({
        error: error.name,
        message,
        stack: error.stack,
    });

    reply.status(statusCode).send({
        success: false,
        error: {
            code: errorCode,
            message,
        },
    });
}; 