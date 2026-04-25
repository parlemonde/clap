'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import { themes } from '@server/database/schemas/themes';

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
