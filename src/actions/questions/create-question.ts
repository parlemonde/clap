'use server';

import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import type { Question } from 'src/database/schemas/questions';
import { questions } from 'src/database/schemas/questions';

type NewQuestion = {
    question: string;
    scenarioId: number;
    languageCode: string;
};
export async function createQuestion(newQuestion: NewQuestion): Promise<Question | undefined> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    const orders = await db
        .select({ order: questions.order })
        .from(questions)
        .orderBy(desc(questions.order))
        .where(and(eq(questions.scenarioId, newQuestion.scenarioId), eq(questions.languageCode, newQuestion.languageCode)))
        .limit(1);
    const order = (orders[0]?.order || 0) + 1;
    const newQuestions = await db
        .insert(questions)
        .values({
            ...newQuestion,
            order,
        })
        .returning();

    // Return new question
    revalidatePath('/');
    revalidatePath('/admin/questions');
    return newQuestions[0];
}
