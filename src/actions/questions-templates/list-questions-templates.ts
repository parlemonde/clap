'use server';

import { and, eq } from 'drizzle-orm';

import { db } from 'src/database';
import type { QuestionTemplate } from 'src/database/schemas/question-template';
import { questionTemplates } from 'src/database/schemas/question-template';

export async function listQuestionsTemplates(scenarioId: number, language?: string): Promise<QuestionTemplate[]> {
    return await db
        .select()
        .from(questionTemplates)
        .where(and(eq(questionTemplates.scenarioId, scenarioId), language ? eq(questionTemplates.languageCode, language) : undefined))
        .orderBy(questionTemplates.order);
}
