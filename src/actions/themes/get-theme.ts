import { eq } from 'drizzle-orm';

import { db } from 'src/database';
import type { Theme } from 'src/database/schemas/themes';
import { themes } from 'src/database/schemas/themes';

export async function getTheme(themeId: number): Promise<Theme | undefined> {
    if (Number.isNaN(themeId) || !Number.isFinite(themeId) || themeId === -1) return undefined;

    return await db.query.themes.findFirst({
        where: eq(themes.id, themeId),
    });
}
