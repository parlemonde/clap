'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import type { Language } from '@server/database/schemas/languages';
import { languages } from '@server/database/schemas/languages';

export async function createLanguage(newLanguage: Language): Promise<void> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.insert(languages).values(newLanguage);

    revalidatePath('/');
    revalidatePath('/admin/languages');
    revalidatePath('/api/languages');
}
