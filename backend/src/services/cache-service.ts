import { createClient, RedisClientType } from 'redis';
import { config } from 'dotenv';

// Load environment variables
config();

// Configure Redis client from environment variables
const redisClient: RedisClientType = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379
    }
});

// Handle connection events
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('reconnecting', () => console.log('Redis Client Reconnecting'));
redisClient.on('ready', () => console.log('Redis Client Ready'));

// Connect to Redis
(async () => {
    await redisClient.connect().catch(console.error);
})();

// Default expiration time (10 minutes in seconds)
const DEFAULT_EXPIRATION = 10 * 60;

/**
 * Set a value in Redis cache
 * @param key The key to store the value under
 * @param value The value to store
 * @param expiration Expiration time in seconds (default: 10 minutes)
 */
export const setCacheData = async <T>(
    key: string,
    value: T,
    expiration: number = DEFAULT_EXPIRATION
): Promise<void> => {
    try {
        const stringValue = JSON.stringify(value);
        await redisClient.set(key, stringValue, { EX: expiration });
    } catch (error) {
        console.error('Error setting Redis cache:', error);
    }
};

/**
 * Get a value from Redis cache
 * @param key The key to retrieve
 * @returns The stored value or null if not found
 */
export const getCacheData = async <T>(key: string): Promise<T | null> => {
    try {
        const data = await redisClient.get(key);
        if (!data) return null;

        return JSON.parse(data) as T;
    } catch (error) {
        console.error('Error getting Redis cache:', error);
        return null;
    }
};

/**
 * Delete a value from Redis cache
 * @param key The key to delete
 */
export const deleteCacheData = async (key: string): Promise<void> => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Error deleting Redis cache:', error);
    }
};

/**
 * Delete multiple values from Redis cache using a pattern
 * @param pattern The pattern to match keys (e.g., "user:*")
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error('Error deleting Redis cache pattern:', error);
    }
};

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
    await redisClient.disconnect();
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = (): boolean => {
    return redisClient.isOpen;
};

export default redisClient; 