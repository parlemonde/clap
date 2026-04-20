import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzleNodePostgres, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

import { databaseSchema, type DatabaseSchema } from './schema';

export type DatabaseBackend = 'pg' | 'pglite';
export type AppDatabase = NodePgDatabase<DatabaseSchema> | PgliteDatabase<DatabaseSchema>;

export const PGLITE_DATA_DIR = path.resolve(process.cwd(), '.pglite');
export const DRIZZLE_MIGRATIONS_FOLDER = path.resolve(process.cwd(), 'drizzle');

const getDatabaseBackend = (): DatabaseBackend => {
    return process.env.DATABASE_URL ? 'pg' : 'pglite';
};

const isLocalPostgresUrl = (databaseUrl: string): boolean => {
    return databaseUrl.includes('localhost');
};

const createPgDatabase = (): { db: NodePgDatabase<DatabaseSchema>; onClose: () => Promise<void> } => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL must be set when using PostgreSQL.');
    }

    const ssl = !isLocalPostgresUrl(databaseUrl);
    const queryClient = new Pool({ connectionString: databaseUrl, ssl, max: 10 });

    return {
        db: drizzleNodePostgres({
            client: queryClient,
            logger: process.env.NODE_ENV !== 'production',
            schema: databaseSchema,
        }),
        onClose: () => queryClient.end(),
    };
};

const createPgliteDatabase = async (): Promise<{ db: PgliteDatabase<DatabaseSchema>; onClose: () => Promise<void> }> => {
    await mkdir(PGLITE_DATA_DIR, { recursive: true });
    const client = new PGlite(PGLITE_DATA_DIR);
    await client.waitReady;
    return {
        db: drizzlePglite({
            client,
            logger: process.env.NODE_ENV !== 'production',
            schema: databaseSchema,
        }),
        onClose: () => client.close(),
    };
};

export const createDatabaseConnection = async (): Promise<
    | { backend: 'pg'; db: NodePgDatabase<DatabaseSchema>; onClose: () => Promise<void> }
    | { backend: 'pglite'; db: PgliteDatabase<DatabaseSchema>; onClose: () => Promise<void> }
> => {
    const backend = getDatabaseBackend();
    if (backend === 'pg') {
        return {
            backend,
            ...createPgDatabase(),
        };
    }
    return {
        backend,
        ...(await createPgliteDatabase()),
    };
};
