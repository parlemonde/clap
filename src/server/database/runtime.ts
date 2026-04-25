import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { databaseSchema, type DatabaseSchema } from './schema';

export type AppDatabase = NodePgDatabase<DatabaseSchema>;

const isLocalPostgresUrl = (databaseUrl: string): boolean => {
    return databaseUrl.includes('localhost');
};

export const createDatabaseConnection = () => {
    const databaseUrl = process.env.DATABASE_URL || '';
    const ssl = !isLocalPostgresUrl(databaseUrl);
    const queryClient = new Pool({ connectionString: databaseUrl, ssl, max: 10 });
    return {
        db: drizzle({
            client: queryClient,
            logger: process.env.NODE_ENV !== 'production',
            schema: databaseSchema,
        }),
        onClose: () => queryClient.end(),
    };
};
