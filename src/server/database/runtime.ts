import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { getEnvVariable } from '@server/get-env-variable';

import { databaseSchema, type DatabaseSchema } from './schema';

export type AppDatabase = NodePgDatabase<DatabaseSchema>;

export const createDatabaseConnection = () => {
    const databaseUrl = getEnvVariable('DATABASE_URL');
    const queryClient = new Pool({ connectionString: databaseUrl, max: 10 });
    return {
        db: drizzle({
            client: queryClient,
            logger: getEnvVariable('NODE_ENV') !== 'production',
            schema: databaseSchema,
        }),
        onClose: () => queryClient.end(),
    };
};
