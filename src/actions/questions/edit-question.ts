'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { questions } from 'src/database/schemas/questions';

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
