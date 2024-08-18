'use server';

import { eq } from 'drizzle-orm';

import { db } from 'src/database';
import type { QuestionTemplate } from 'src/database/schemas/question-template';
import { questionTemplates } from 'src/database/schemas/question-template';

export async function listQuestionsTemplates(scenarioId: number): Promise<QuestionTemplate[]> {
    return await db.select().from(questionTemplates).where(eq(questionTemplates.scenarioId, scenarioId)).orderBy(questionTemplates.order);
}
