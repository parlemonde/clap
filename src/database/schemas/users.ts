import { pgTable, serial, varchar, char, smallint } from 'drizzle-orm/pg-core';

const ROLES_ENUM = ['admin', 'teacher', 'student'] as const;

export type Role = (typeof ROLES_ENUM)[number];

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 150 }).notNull().unique(),
    name: varchar('name', { length: 150 }).notNull(),
    passwordHash: char('passwordHash', { length: 100 }),
    verificationHash: char('verificationHash', { length: 100 }),
    accountRegistration: smallint('accountRegistration').notNull().default(0),
    role: varchar('role', { length: 20, enum: ROLES_ENUM }).notNull().default('teacher'),
});

type FullUser = typeof users.$inferSelect;
export type User = Pick<FullUser, 'id' | 'name' | 'email' | 'role'> & {
    teacherId?: number;
    projectId?: number;
    questionId?: number;
};
