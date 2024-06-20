import { integer, pgTable, serial, varchar, boolean } from 'drizzle-orm/pg-core';

import { users } from './users';
import { json } from '../lib/custom-json';

export const themes = pgTable('themes', {
    id: serial('id').primaryKey(),
    order: integer('order'),
    isDefault: boolean('isDefault').default(false),
    imageUrl: varchar('imageUrl', { length: 4000 }),
    names: json<'names', Record<string, string>>('names').notNull(),
    userId: integer('userId').references(() => users.id, {
        onDelete: 'cascade',
    }),
});

export type Theme = typeof themes.$inferSelect;
export type NewTheme = Omit<typeof themes.$inferInsert, 'id'>;
