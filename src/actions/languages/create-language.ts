'use server';

import { revalidatePath } from 'next/cache';
import { db } from 'src/database';
import type { Language } from 'src/database/schemas/languages';
import { languages } from 'src/database/schemas/languages';

import { getCurrentUser } from '../get-current-user';

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
