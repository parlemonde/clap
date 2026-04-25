'use server';

import { eq } from 'drizzle-orm';

import { db } from '@server/database';
import type { Theme } from '@server/database/schemas/themes';
import { themes } from '@server/database/schemas/themes';

export async function getTheme(themeId: number): Promise<Theme | undefined> {
    return await db.query.themes.findFirst({
        where: eq(themes.id, themeId),
    });
}
