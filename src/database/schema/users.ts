import { mysqlTable, varchar, int, boolean } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: int('id').autoincrement().primaryKey(),
    email: varchar('email', { length: 150 }).notNull().unique(),
    name: varchar('name', { length: 150 }).notNull(),
    passwordHash: varchar('passwordHash', { length: 180 }).notNull(),
    accountRegistration: int('accountRegistration').notNull().default(0),
    isAdmin: boolean('isAdmin').notNull().default(false),
});

export type FullUser = typeof users.$inferSelect;
export type User = Pick<FullUser, 'id' | 'name' | 'email' | 'isAdmin'>;
export type NewUser = Omit<typeof users.$inferInsert, 'id'>;
