import { pgTable, varchar, char } from 'drizzle-orm/pg-core';

export const languages = pgTable('languages', {
    value: char('value', { length: 2 }).primaryKey(),
    label: varchar('label', { length: 40 }).notNull(),
});

export type Language = typeof languages.$inferSelect;
