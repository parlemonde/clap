import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { db } from './database';
import { languages } from './schemas/languages';
import { users } from './schemas/users';

const DATABASE_URL = process.env.DATABASE_URL || '';

async function createDatabase(): Promise<void> {
    try {
        const ssl = DATABASE_URL.includes('localhost') ? false : 'verify-full';
        // eslint-disable-next-line camelcase
        const client = postgres(DATABASE_URL.replace(/\/[^/]*$/, ''), { debug: true, ssl, connect_timeout: 4 });
        const dbName = DATABASE_URL.split('/').pop()?.replace(/\?.*$/, '');
        if (!dbName) {
            throw new Error('Database name not found in DATABASE_URL');
        }
        const res = await client`SELECT datname FROM pg_catalog.pg_database WHERE datname = ${dbName}`;
        if (res.length === 0) {
            await client`CREATE DATABASE ${dbName}`;
        }
        await client.end();
    } catch (e) {
        console.error(e);
    }
}

async function createAdminUser(): Promise<void> {
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminName || !adminPassword || !adminEmail) {
        return;
    }

    try {
        const results = await db.select().from(users).where(eq(users.name, adminName)).limit(1);
        if (results.length > 0) {
            return;
        }
        const user = {
            name: adminName,
            email: adminEmail,
            passwordHash: await hash(adminPassword),
            role: 'admin' as const,
        };
        await db.insert(users).values(user);
    } catch {
        return;
    }
}

async function createDefaultLanguage(): Promise<void> {
    try {
        const results = await db.query.languages.findFirst({
            where: eq(languages.value, 'fr'),
        });
        if (results) {
            return;
        }
        await db.insert(languages).values({
            value: 'fr',
            label: 'Français',
        });
    } catch {
        return;
    }
}

const start = async () => {
    await createDatabase();
    const ssl = DATABASE_URL.includes('localhost') ? false : 'verify-full';
    const migrationClient = postgres(DATABASE_URL, { max: 1, ssl });
    const db = drizzle(migrationClient, { logger: process.env.NODE_ENV !== 'production' });
    await migrate(db, { migrationsFolder: './drizzle' });
    await createAdminUser();
    await createDefaultLanguage();
    await migrationClient.end();
    process.exit();
};

start().catch(console.error);
