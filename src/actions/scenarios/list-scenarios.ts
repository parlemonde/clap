'use server';

import { or, eq, and } from 'drizzle-orm';

import { db } from 'src/database';
import { scenarios, type Scenario } from 'src/database/schemas/scenarios';

type ListScenariosArgs = {
    themeId?: number;
    userId?: number;
};

export async function listScenarios({ themeId, userId }: ListScenariosArgs = {}): Promise<Scenario[]> {
    return await db
        .select()
        .from(scenarios)
        .where(
            and(
                themeId ? eq(scenarios.themeId, themeId) : undefined,
                or(userId ? eq(scenarios.userId, userId) : undefined, eq(scenarios.isDefault, true)),
            ),
        );
}
