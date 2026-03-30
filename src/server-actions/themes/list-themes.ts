'use server';

import { or, eq, asc, desc, and, isNotNull } from 'drizzle-orm';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import type { Theme } from '@server/database/schemas/themes';
import { themes } from '@server/database/schemas/themes';

type ListThemesArgs = {
    userId?: string;
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
