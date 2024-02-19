'use server';

import { or, eq, asc, desc } from 'drizzle-orm';

import { db } from 'src/database';
import { themes } from 'src/database/schema/themes';

type ListThemesArgs = {
    userId?: number;
};

export async function listThemes({ userId }: ListThemesArgs = {}) {
    return await db
        .select()
        .from(themes)
        .where(or(userId ? eq(themes.userId, userId) : undefined, eq(themes.isDefault, true)))
        .orderBy(desc(themes.isDefault), asc(themes.order));
}
