'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { questions } from 'src/database/schemas/questions';

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
