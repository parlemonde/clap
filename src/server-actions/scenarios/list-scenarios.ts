'use server';

import { or, eq, and, count, isNotNull } from 'drizzle-orm';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import { questions } from '@server/database/schemas/questions';
import { scenarios, type Scenario } from '@server/database/schemas/scenarios';

type ListScenariosArgs = {
    themeId?: number;
    userId?: string;
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

export async function listUserScenarios(): Promise<Scenario[]> {
    const user = await getCurrentUser();
    if (user?.role !== 'admin') {
        return [];
    }

    const scenarioList: Scenario[] = await db
        .select()
        .from(scenarios)
        .where(and(isNotNull(scenarios.userId), eq(scenarios.isDefault, false)));
    return scenarioList;
}
