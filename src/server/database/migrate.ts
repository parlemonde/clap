import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'node:path';
import { loadEnvFile } from 'node:process';

import { getEnvVariable } from '@server/get-env-variable';
import { logger } from '@server/logger';

import type { AppDatabase } from './runtime';
import { createDatabaseConnection } from './runtime';
import type { DatabaseSchema } from './schema';
import { auth_accounts } from './schemas/auth-schemas';
import { languages } from './schemas/languages';
import { users } from './schemas/users';

const DRIZZLE_MIGRATIONS_FOLDER = path.resolve(process.cwd(), 'drizzle');

async function seedAdminUser(db: AppDatabase): Promise<void> {
    const adminPassword = getEnvVariable('ADMIN_PASSWORD');
    const adminEmail = getEnvVariable('ADMIN_EMAIL').toLowerCase();

    if (!adminPassword || !adminEmail) {
        return;
    }

    try {
        const existingAdmin = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1);
        if (existingAdmin.length > 0) {
            return;
        }

        const [newAdmin] = await db
            .insert(users)
            .values({
                email: adminEmail,
                emailVerified: false,
                name: getEnvVariable('ADMIN_NAME'),
                role: 'admin',
            })
            .returning();

        if (!newAdmin) {
            return;
        }

        const now = new Date();
        await db.insert(auth_accounts).values({
            accountId: newAdmin.id,
            providerId: 'credential',
            userId: newAdmin.id,
            password: await hash(adminPassword),
            createdAt: now,
            updatedAt: now,
        });
    } catch (error) {
        logger.error(error);
    }
}

async function seedDefaultLanguage(db: AppDatabase): Promise<void> {
    try {
        const existingLanguage = await db.query.languages.findFirst({
            where: eq(languages.value, 'fr'),
        });
        if (existingLanguage) {
            return;
        }

        await db.insert(languages).values({
            value: 'fr',
            label: 'Francais',
        });
    } catch (error) {
        logger.error(error);
    }
}

const start = async () => {
    try {
        loadEnvFile();
    } catch {
        // Ignore. Env file might not exist.
    }
    const { db, onClose } = createDatabaseConnection();
    await migrate(db as NodePgDatabase<DatabaseSchema>, { migrationsFolder: DRIZZLE_MIGRATIONS_FOLDER });
    await seedAdminUser(db);
    await seedDefaultLanguage(db);
    await onClose();
};

start().catch((error) => {
    logger.error(error);
    process.exitCode = 1;
});
