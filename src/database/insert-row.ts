import { sql } from 'drizzle-orm';
import type { MySqlInsertValue, MySqlTable } from 'drizzle-orm/mysql-core';
import type { MySqlQueryResult } from 'drizzle-orm/mysql2';

import { db } from './database';

interface QueryResult<TDataOut> extends MySqlQueryResult<TDataOut> {}

export async function insertRow<T extends MySqlTable>(table: T, row: MySqlInsertValue<T>) {
    let newId: number | undefined;
    await db.transaction(async (tx) => {
        await tx.insert(table).values([row]);
        const [rows] = (await tx.execute(sql`SELECT LAST_INSERT_ID() as \`id\`;`)) as unknown as QueryResult<{ id: number }>;
        newId = rows[0]?.id;
    });
    return newId;
}
