import 'reflect-metadata';
import { config } from 'dotenv';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { AppDataSource } from '@config/data-source';
import { errorHandler } from './middlewares/error-handler';
import { authRoutes } from '@routes/auth-routes';
import { userRoutes } from '@routes/user-routes';
import { searchRoutes } from '@routes/search-routes';
import redisClient, { isRedisConnected, disconnectRedis } from './services/cache-service';

config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;

// Database initialization
const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connection established');
        return true;
    } catch (error) {
        console.error('Error connecting to database:', error);
        return false;
    }
};

// Check Redis connection
const checkRedisConnection = async () => {
    try {
        if (!isRedisConnected()) {
            console.log('Redis not connected, attempting to connect...');
            await redisClient.connect();
        }

        // Simple ping-pong test
        await redisClient.ping();
        console.log('Redis connection established');
        return true;
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        return false;
    }
};

// Server initialization
const startServer = async () => {
    const app = fastify({
        logger: process.env.NODE_ENV === 'development',
    });

    // Register plugins
    await app.register(fastifyCors, {
        origin: true, // Allow all origins in development
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
    });

    // Register Swagger documentation
    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'Delice API',
                description: 'API for managing artisan food product stores and orders',
                version: '1.0.0',
            },
            servers: [
                {
                    url: `http://localhost:${PORT}`,
                    description: 'Development server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    });

    await app.register(fastifySwaggerUi, {
        routePrefix: '/documentation',
    });

    // Register error handler
    app.setErrorHandler(errorHandler);

    // Register routes
    app.register(authRoutes, { prefix: '/api/auth' });
    app.register(userRoutes, { prefix: '/api/users' });
    app.register(searchRoutes, { prefix: '/api' });

    // Root route for API status
    app.get('/', async () => {
        return {
            message: 'API Delice está rodando!',
            redis: isRedisConnected() ? 'connected' : 'disconnected'
        };
    });

    // Graceful shutdown function
    const closeGracefully = async (signal: string) => {
        console.log(`Received ${signal}, closing connections...`);

        // Close Redis connection
        if (isRedisConnected()) {
            await disconnectRedis();
            console.log('Redis connection closed');
        }

        // Close database connection
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('Database connection closed');
        }

        // Exit process
        process.exit(0);
    };

    // Listen for SIGTERM and SIGINT signals
    process.on('SIGTERM', () => closeGracefully('SIGTERM'));
    process.on('SIGINT', () => closeGracefully('SIGINT'));

    try {
        // Listen on all interfaces
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server is running on port ${PORT}`);
        console.log(`Server is accessible at http://localhost:${PORT}`);
        console.log(`Server is accessible at http://0.0.0.0:${PORT}`);
        console.log('CORS is enabled for all origins');
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

// Start the application
const start = async () => {
    const dbConnected = await initializeDatabase();
    const redisConnected = await checkRedisConnection();

    if (dbConnected && redisConnected) {
        await startServer();
    } else {
        console.error('Failed to start server due to connection errors');
        process.exit(1);
    }
};

start().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
}); 