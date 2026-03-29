'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from 'src/database';
import { themes } from 'src/database/schemas/themes';

import { getCurrentUser } from '../get-current-user';

export async function updateThemesOrder(order: number[]) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    for (const [index, id] of order.entries()) {
        await db
            .update(themes)
            .set({
                order: index,
            })
            .where(eq(themes.id, id));
    }
    revalidatePath('/');
    revalidatePath('/admin/themes');
}
