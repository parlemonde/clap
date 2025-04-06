'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { themes } from 'src/database/schemas/themes';

export async function deleteTheme(themeId: number) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.delete(themes).where(eq(themes.id, themeId));
    revalidatePath('/');
    revalidatePath('/admin/themes');
}
