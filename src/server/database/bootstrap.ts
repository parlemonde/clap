import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate as migrateNodePostgres } from 'drizzle-orm/node-postgres/migrator';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';

import type { AppDatabase, DatabaseBackend } from './runtime';
import { DRIZZLE_MIGRATIONS_FOLDER } from './runtime';
import type { DatabaseSchema } from './schema';
import { auth_accounts } from './schemas/auth-schemas';
import { languages } from './schemas/languages';
import { users } from './schemas/users';

export async function runMigrations(db: AppDatabase, backend: DatabaseBackend): Promise<void> {
    if (backend === 'pg') {
        await migrateNodePostgres(db as NodePgDatabase<DatabaseSchema>, { migrationsFolder: DRIZZLE_MIGRATIONS_FOLDER });
        return;
    }

    await migratePglite(db as unknown as PgliteDatabase<DatabaseSchema>, { migrationsFolder: DRIZZLE_MIGRATIONS_FOLDER });
}

export async function seedAdminUser(db: AppDatabase): Promise<void> {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

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
                name: process.env.ADMIN_NAME || 'Admin',
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
        console.error(error);
    }
}

export async function seedDefaultLanguage(db: AppDatabase): Promise<void> {
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
        console.error(error);
    }
}
