import { redisClient } from './client';

export async function setRedisValue<T>(key: string, value: T): Promise<void> {
    await redisClient.set(key, JSON.stringify(value));
}
