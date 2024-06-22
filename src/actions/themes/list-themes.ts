'use server';

import { or, eq, asc, desc } from 'drizzle-orm';

import { db } from 'src/database';
import type { Theme } from 'src/database/schemas/themes';
import { themes } from 'src/database/schemas/themes';

type ListThemesArgs = {
    userId?: number;
};

export async function listThemes({ userId }: ListThemesArgs = {}): Promise<Theme[]> {
    return await db
        .select()
        .from(themes)
        .where(or(userId ? eq(themes.userId, userId) : undefined, eq(themes.isDefault, true)))
        .orderBy(desc(themes.isDefault), asc(themes.order));
}
