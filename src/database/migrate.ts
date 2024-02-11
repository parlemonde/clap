import 'dotenv/config';
import { migrate } from 'drizzle-orm/mysql2/migrator';

import { db, connection } from '.';

const start = async () => {
    await migrate(db, { migrationsFolder: './drizzle' });
    connection.end();
};

start().catch(console.error);
