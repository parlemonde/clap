import { mysqlTable, varchar, int, boolean } from 'drizzle-orm/mysql-core';

import { users } from './users';
import { json } from '../lib/custom-json';

export const themes = mysqlTable('themes', {
    id: int('id').autoincrement().primaryKey(),
    order: int('order'),
    isDefault: boolean('isDefault').default(false),
    imageUrl: varchar('imageUrl', { length: 4000 }),
    names: json<'names', Record<string, string>>('names').notNull(),
    userId: int('userId').references(() => users.id, {
        onDelete: 'cascade',
    }),
});

export type Theme = typeof themes.$inferSelect;
export type NewTheme = Omit<typeof themes.$inferInsert, 'id'>;
