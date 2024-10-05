import Redis from 'ioredis';

export const redisClient = new Redis(process.env.REDIS_URL || '', {
    retryStrategy: (times) => (times > 3 ? undefined : 1000), // retry every 1s for 3 times max
    commandTimeout: 5000, // 5s timeout for each command
});
