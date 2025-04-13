import { integer, pgTable, serial, boolean } from 'drizzle-orm/pg-core';

import { themes } from './themes';
import { users } from './users';
import { json } from '../lib/custom-json';

export const scenarios = pgTable('scenarios', {
    id: serial('id').primaryKey(),
    isDefault: boolean('isDefault').default(false),
    names: json<'names', Record<string, string>>('names').notNull(),
    descriptions: json<'descriptions', Record<string, string>>('descriptions').notNull(),
    userId: integer('userId').references(() => users.id, {
        onDelete: 'cascade',
    }),
    themeId: integer('themeId')
        .references(() => themes.id, {
            onDelete: 'cascade',
        })
        .notNull(),
});

export type Scenario = typeof scenarios.$inferSelect & {
    questionsCount?: Record<string, number>;
};
