'use server';

import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import type { QuestionTemplate } from 'src/database/schemas/question-template';
import { questionTemplates } from 'src/database/schemas/question-template';

type NewQuestionTemplate = {
    question: string;
    scenarioId: number;
    languageCode: string;
};
export async function createQuestionTemplate(newQuestionTemplate: NewQuestionTemplate): Promise<QuestionTemplate | undefined> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    const orders = await db
        .select({ order: questionTemplates.order })
        .from(questionTemplates)
        .orderBy(desc(questionTemplates.order))
        .where(
            and(
                eq(questionTemplates.scenarioId, newQuestionTemplate.scenarioId),
                eq(questionTemplates.languageCode, newQuestionTemplate.languageCode),
            ),
        )
        .limit(1);
    const order = (orders[0]?.order || 0) + 1;
    const newQuestionTemplates = await db
        .insert(questionTemplates)
        .values({
            ...newQuestionTemplate,
            order,
        })
        .returning();

    // Return new scenario
    revalidatePath('/');
    revalidatePath('/admin/questions');
    return newQuestionTemplates[0];
}
