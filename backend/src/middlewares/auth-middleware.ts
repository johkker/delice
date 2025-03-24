import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@entities/User';

// Auth middleware to require authenticated users
export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (error) {
        reply.status(401).send({
            success: false,
            error: {
                message: 'Unauthorized: Authentication required',
            },
        });
    }
};

// Role-based middleware for producers
export const requireProducer = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();

        const user = request.user as { roles: UserRole[] };

        if (!user.roles.includes(UserRole.PRODUCER)) {
            reply.status(403).send({
                success: false,
                error: {
                    message: 'Forbidden: Producer role required',
                },
            });
        }
    } catch (error) {
        reply.status(401).send({
            success: false,
            error: {
                message: 'Unauthorized: Authentication required',
            },
        });
    }
};

// Role-based middleware for admins
export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();

        const user = request.user as { roles: UserRole[] };

        if (!user.roles.includes(UserRole.ADMIN)) {
            reply.status(403).send({
                success: false,
                error: {
                    message: 'Forbidden: Admin role required',
                },
            });
        }
    } catch (error) {
        reply.status(401).send({
            success: false,
            error: {
                message: 'Unauthorized: Authentication required',
            },
        });
    }
}; 