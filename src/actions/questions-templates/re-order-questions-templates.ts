'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { questionTemplates } from 'src/database/schemas/question-template';

export async function reOrderQuestionsTemplates(order: number[]) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    for (const [index, id] of order.entries()) {
        await db
            .update(questionTemplates)
            .set({
                order: index,
            })
            .where(eq(questionTemplates.id, id));
    }
    revalidatePath('/');
    revalidatePath('/admin/questions');
}
