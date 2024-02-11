import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: int('id').autoincrement().primaryKey(),
    email: varchar('email', { length: 150 }).notNull().unique(),
    name: varchar('name', { length: 150 }).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = Omit<typeof users.$inferInsert, 'id'>;
