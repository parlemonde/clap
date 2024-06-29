'use server';

import { and, desc, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import type { NewTheme, Theme } from 'src/database/schemas/themes';
import { themes } from 'src/database/schemas/themes';

// User action to create a new theme
export async function createTheme(themeName: string): Promise<Theme | undefined> {
    const currentLocale = cookies().get('app-language')?.value || 'fr';
    const user = await getCurrentUser();
    if (!user) {
        return;
    }

    const newThemes = await db
        .insert(themes)
        .values({
            names: {
                [currentLocale]: themeName,
            },
            userId: user.id,
        })
        .returning();

    // Return new theme
    revalidatePath('/');
    revalidatePath('/admin/themes');
    return newThemes[0];
}

// Admin action to add a new default theme
export async function createDefaultTheme(newTheme: Omit<NewTheme, 'order' | 'userId'>): Promise<Theme | undefined> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    const orders = await db
        .select({ order: themes.order })
        .from(themes)
        .orderBy(desc(themes.order))
        .where(and(isNull(themes.userId), eq(themes.isDefault, true)))
        .limit(1);
    const order = (orders[0]?.order || 0) + 1;
    const newThemes = await db
        .insert(themes)
        .values({ ...newTheme, order })
        .returning();

    // Return new theme
    revalidatePath('/');
    revalidatePath('/admin/themes');
    return newThemes[0];
}
