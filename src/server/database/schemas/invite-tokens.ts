import { pgTable, serial, char, timestamp } from 'drizzle-orm/pg-core';

export const inviteTokens = pgTable('invite_tokens', {
    id: serial('id').primaryKey(),
    token: char('token', { length: 20 }).notNull(),
    createdAt: timestamp('createDate', { withTimezone: true }).notNull().defaultNow(),
});

export type InviteToken = typeof inviteTokens.$inferSelect;
