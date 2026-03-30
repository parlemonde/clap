'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';

export async function deleteLanguage(languageCode: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    try {
        await db.delete(languages).where(eq(languages.value, languageCode));
        revalidatePath('/');
        revalidatePath('/admin/languages');
        revalidatePath('/api/languages');
    } catch {
        // Ignore error
    }
}
