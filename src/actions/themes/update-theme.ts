'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { themes } from 'src/database/schemas/themes';

type UpdatedTheme = {
    themeId: number;
    names: Record<string, string>;
    imageUrl?: string | null;
};
export async function updateDefaultTheme(updatedTheme: UpdatedTheme) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db
        .update(themes)
        .set({
            names: updatedTheme.names,
            imageUrl: updatedTheme.imageUrl,
        })
        .where(eq(themes.id, updatedTheme.themeId));

    revalidatePath('/');
    revalidatePath('/admin/themes');
}
