import { integer, pgTable, serial, varchar, boolean } from 'drizzle-orm/pg-core';

import { json } from '@server/database/lib/custom-json';

import { users } from './users';

export const themes = pgTable('themes', {
    id: serial('id').primaryKey(),
    order: integer('order'),
    isDefault: boolean('isDefault').default(false),
    imageUrl: varchar('imageUrl', { length: 2000 }),
    names: json<'names', Record<string, string>>('names').notNull(),
    userId: integer('userId').references(() => users.id, {
        onDelete: 'cascade',
    }),
});

export type Theme = typeof themes.$inferSelect;
