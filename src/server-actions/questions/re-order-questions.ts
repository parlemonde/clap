'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@server/database';
import { questions } from '@server/database/schemas/questions';

import { getCurrentUser } from '@server-actions/get-current-user';

export async function reOrderQuestions(order: number[]) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    for (const [index, id] of order.entries()) {
        await db
            .update(questions)
            .set({
                order: index,
            })
            .where(eq(questions.id, id));
    }
    revalidatePath('/');
    revalidatePath('/admin/questions');
}
