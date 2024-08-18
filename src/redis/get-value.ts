import { redisClient } from './client';

export async function getRedisValue<T>(key: string): Promise<T | undefined> {
    try {
        const value = await redisClient.get(key);
        if (value !== null) {
            return JSON.parse(value) as T;
        }
    } catch (e) {
        console.error(e);
    }
}
