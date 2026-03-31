/* eslint-disable camelcase */
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

import { auth } from '@server/auth/auth';

import { db } from './database';
import { auth_sessions } from './schemas/auth-schemas';
import { languages } from './schemas/languages';
import { users } from './schemas/users';

const DATABASE_URL = process.env.DATABASE_URL || '';

async function createDatabase(): Promise<void> {
    if (!DATABASE_URL.includes('localhost')) {
        // Skip database creation on non-local environments.
        return;
    }
    try {
        const client = new Client({ connectionString: DATABASE_URL.replace(/\/[^/]*$/, ''), ssl: false });
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_catalog.pg_database WHERE datname = $1', ['clap']);
        if (res.rows.length === 0) {
            await client.query('CREATE DATABASE clap');
        }
        await client.end();
    } catch (e) {
        console.error(e);
    }
}

async function createAdminUser(): Promise<void> {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminPassword || !adminEmail) {
        return;
    }

    try {
        const results = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
        if (results.length > 0) {
            return;
        }
        const result = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: 'Admin',
            },
        });
        await db
            .update(users)
            .set({
                role: 'admin',
            })
            .where(eq(users.id, result.user.id));
        if (result.token !== null) {
            await db.delete(auth_sessions).where(eq(auth_sessions.token, result.token));
        }
    } catch (error) {
        console.error(error);
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
    await migrate(db, { migrationsFolder: './drizzle' });
    await createAdminUser();
    await createDefaultLanguage();
};

start()
    .catch(console.error)
    .finally(() => process.exit());
