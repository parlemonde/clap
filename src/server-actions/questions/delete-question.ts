'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@server/database';
import { questions } from '@server/database/schemas/questions';

import { getCurrentUser } from '@server-actions/get-current-user';

export async function deleteQuestion(questionId: number) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.delete(questions).where(eq(questions.id, questionId));
    revalidatePath('/');
    revalidatePath('/admin/questions');
}
