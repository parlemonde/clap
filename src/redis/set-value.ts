import { redisClient } from './client';

export async function setRedisValue<T>(key: string, value: T): Promise<void> {
    if (!redisClient.isReady) {
        await redisClient.connect();
    }
    await redisClient.set(key, JSON.stringify(value));
}
