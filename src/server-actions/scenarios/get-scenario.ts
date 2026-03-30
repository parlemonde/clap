'use server';

import { eq } from 'drizzle-orm';

import { db } from '@server/database';
import { scenarios, type Scenario } from '@server/database/schemas/scenarios';

export async function getScenario(scenarioId: number): Promise<Scenario | undefined> {
    return await db.query.scenarios.findFirst({
        where: eq(scenarios.id, scenarioId),
    });
}
