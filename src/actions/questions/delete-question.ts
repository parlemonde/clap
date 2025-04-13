'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { questions } from 'src/database/schemas/questions';

export async function deleteQuestion(questionId: number) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.delete(questions).where(eq(questions.id, questionId));
    revalidatePath('/');
    revalidatePath('/admin/questions');
}
