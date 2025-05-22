'use server';

import { or, eq, and, count } from 'drizzle-orm';

import { db } from 'src/database';
import { questions } from 'src/database/schemas/questions';
import { scenarios, type Scenario } from 'src/database/schemas/scenarios';

type ListScenariosArgs = {
    themeId?: number;
    userId?: number;
    questionLanguageCode?: string;
};

export async function listScenarios({ themeId, userId, questionLanguageCode }: ListScenariosArgs = {}): Promise<Scenario[]> {
    const scenarioList: Scenario[] = await db
        .select()
        .from(scenarios)
        .where(
            and(
                themeId ? eq(scenarios.themeId, themeId) : undefined,
                or(userId ? eq(scenarios.userId, userId) : undefined, eq(scenarios.isDefault, true)),
            ),
        );

    if (questionLanguageCode) {
        const countOfQuestionsPerScenarioList = await db
            .select({
                scenarioId: questions.scenarioId,
                count: count(),
            })
            .from(questions)
            .where(eq(questions.languageCode, questionLanguageCode))
            .groupBy(questions.scenarioId);
        const countOfQuestionsPerScenario = Object.fromEntries(countOfQuestionsPerScenarioList.map(({ scenarioId, count }) => [scenarioId, count]));

        for (const scenario of scenarioList) {
            scenario.questionsCount = countOfQuestionsPerScenario[scenario.id] || 0;
        }
    }

    return scenarioList;
}
