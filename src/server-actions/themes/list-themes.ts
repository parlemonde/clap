'use server';

import { or, eq, asc, desc, and, isNotNull } from 'drizzle-orm';

import { db } from '@server/database';
import type { Theme } from '@server/database/schemas/themes';
import { themes } from '@server/database/schemas/themes';

import { getCurrentUser } from '@server-actions/get-current-user';

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

export async function listUserThemes(): Promise<Theme[]> {
    const user = await getCurrentUser();
    if (user?.role !== 'admin') {
        return [];
    }
    return await db
        .select()
        .from(themes)
        .where(and(isNotNull(themes.userId), eq(themes.isDefault, false)))
        .orderBy(asc(themes.order));
}
