'use server';

import { and, eq } from 'drizzle-orm';

import { db } from 'src/database';
import type { Question } from 'src/database/schemas/questions';
import { questions } from 'src/database/schemas/questions';

export async function listQuestions(scenarioId: number, language?: string): Promise<Question[]> {
    return await db
        .select()
        .from(questions)
        .where(and(eq(questions.scenarioId, scenarioId), language ? eq(questions.languageCode, language) : undefined))
        .orderBy(questions.order);
}
