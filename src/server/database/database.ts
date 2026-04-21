import { registerService } from '@server/register-service';

import { createDatabaseConnection, type AppDatabase } from './runtime';

export const db = registerService('db', (): AppDatabase => {
    return createDatabaseConnection().db;
});
