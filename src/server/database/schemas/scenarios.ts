import { integer, pgTable, serial, boolean, uuid } from 'drizzle-orm/pg-core';

import { json } from '@server/database/lib/custom-json';

import { themes } from './themes';
import { users } from './users';

export const scenarios = pgTable('scenarios', {
    id: serial('id').primaryKey(),
    isDefault: boolean('isDefault').default(false),
    names: json<'names', Record<string, string>>('names').notNull(),
    descriptions: json<'descriptions', Record<string, string>>('descriptions').notNull(),
    userId: uuid('userId').references(() => users.id, {
        onDelete: 'cascade',
    }),
    themeId: integer('themeId')
        .references(() => themes.id, {
            onDelete: 'cascade',
        })
        .notNull(),
});

export type Scenario = typeof scenarios.$inferSelect & {
    questionsCount?: number;
};
