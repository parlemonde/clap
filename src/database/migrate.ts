import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { db } from './database';
import { languages } from './schemas/languages';
import type { NewUser } from './schemas/users';
import { users } from './schemas/users';

const DATABASE_URL = process.env.DATABASE_URL || '';

async function createDatabase(): Promise<void> {
    try {
        const client = postgres(DATABASE_URL.replace(/\/[^/]*$/, ''), { debug: true });
        const res = await client`SELECT datname FROM pg_catalog.pg_database WHERE datname = ${'clap'}`;
        if (res.length === 0) {
            await client`CREATE DATABASE clap`;
        }
        await client.end();
    } catch (e) {
        console.error(e);
    }
}

async function createAdminUser(): Promise<void> {
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminName || !adminPassword) {
        return;
    }

    try {
        const results = await db.select().from(users).where(eq(users.name, adminName)).limit(1);
        if (results.length > 0) {
            return;
        }
        const user: NewUser = {
            name: adminName,
            email: process.env.ADMIN_EMAIL || 'admin@clap.parlemonde.org',
            passwordHash: await argon2.hash(adminPassword),
            role: 'admin',
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
    const migrationClient = postgres(DATABASE_URL, { max: 1 });
    const db = drizzle(migrationClient, { logger: process.env.NODE_ENV !== 'production' });
    await migrate(db, { migrationsFolder: './drizzle' });
    await createAdminUser();
    await createDefaultLanguage();
    await migrationClient.end();
    process.exit();
};

if (process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('Not running migrations on Vercel dev and preview deployments.');
} else {
    start().catch(console.error);
}
