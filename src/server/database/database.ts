import { registerService } from '@server/register-service';

import { runMigrations, seedAdminUser, seedDefaultLanguage } from './bootstrap';
import { createDatabaseConnection, type AppDatabase } from './runtime';

export const db = await registerService('db', async (): Promise<AppDatabase> => {
    const { backend, db } = await createDatabaseConnection();
    if (backend === 'pglite') {
        await runMigrations(db, 'pglite');
        await seedAdminUser(db);
        await seedDefaultLanguage(db);
    }
    return db;
});
