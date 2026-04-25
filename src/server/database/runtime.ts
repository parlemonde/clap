import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { databaseSchema, type DatabaseSchema } from './schema';

export type AppDatabase = NodePgDatabase<DatabaseSchema>;

export const createDatabaseConnection = () => {
    const databaseUrl = process.env.DATABASE_URL || '';
    const queryClient = new Pool({ connectionString: databaseUrl, max: 10 });
    return {
        db: drizzle({
            client: queryClient,
            logger: process.env.NODE_ENV !== 'production',
            schema: databaseSchema,
        }),
        onClose: () => queryClient.end(),
    };
};
