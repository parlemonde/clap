import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2';

/**
 * Register service: Stores instances in `global` to prevent memory leaks in development.
 *
 */
const registerService = <T>(name: string, initFn: () => T): T => {
    if (process.env.NODE_ENV !== 'production') {
        if (!(name in global)) {
            (global as Record<string, unknown>)[name] = initFn();
        }
        return (global as Record<string, unknown>)[name] as T;
    }
    return initFn();
};

export const poolConnection = mysql.createPool({
    charset: 'utf8mb4_unicode_ci',
    database: process.env.DB_NAME || '',
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    connectionLimit: 10,
});
export const db = registerService('db', () => drizzle(poolConnection, { logger: process.env.NODE_ENV !== 'production' }));
