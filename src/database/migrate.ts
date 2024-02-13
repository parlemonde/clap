import 'dotenv/config';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/mysql2/migrator';

import { db, poolConnection } from './database';
import type { NewUser } from './schema/users';
import { users } from './schema/users';

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
            isAdmin: true,
        };
        await db.insert(users).values(user);
    } catch {
        return;
    }
}

const start = async () => {
    await migrate(db, { migrationsFolder: './drizzle' });
    await createAdminUser();
    poolConnection.end();
};

start().catch(console.error);
