'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@server/database';
import { questions } from '@server/database/schemas/questions';

import { getCurrentUser } from '@server-actions/get-current-user';

type UpdatedQuestion = {
    id: number;
    question: string;
};
export async function editQuestion(updatedQuestion: UpdatedQuestion): Promise<void> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db
        .update(questions)
        .set({
            question: updatedQuestion.question,
        })
        .where(eq(questions.id, updatedQuestion.id));

    // Return new question
    revalidatePath('/');
    revalidatePath('/admin/questions');
}
