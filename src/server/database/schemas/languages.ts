import { char, jsonb, pgTable, varchar } from 'drizzle-orm/pg-core';
import type { AbstractIntlMessages } from 'next-intl';

export const languages = pgTable('languages', {
    value: char('value', { length: 2 }).primaryKey(),
    label: varchar('label', { length: 40 }).notNull(),
    locales: jsonb('locales').$type<AbstractIntlMessages>(),
});

export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;
export type LanguageOption = Pick<Language, 'value' | 'label'>;
