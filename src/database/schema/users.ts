import { integer, pgTable, serial, varchar, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 150 }).notNull().unique(),
    name: varchar('name', { length: 150 }).notNull(),
    passwordHash: varchar('passwordHash', { length: 180 }).notNull(),
    accountRegistration: integer('accountRegistration').notNull().default(0),
    isAdmin: boolean('isAdmin').notNull().default(false),
});

export type FullUser = typeof users.$inferSelect;
export type User = Pick<FullUser, 'id' | 'name' | 'email' | 'isAdmin'>;
export type NewUser = Omit<typeof users.$inferInsert, 'id'>;
