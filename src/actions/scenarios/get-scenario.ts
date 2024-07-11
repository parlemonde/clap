import { eq } from 'drizzle-orm';

import { db } from 'src/database';
import { scenarios, type Scenario } from 'src/database/schemas/scenarios';

export async function getScenario(scenarioId: number): Promise<Scenario | undefined> {
    if (Number.isNaN(scenarioId) || !Number.isFinite(scenarioId) || scenarioId === -1) return undefined;

    return await db.query.scenarios.findFirst({
        where: eq(scenarios.id, scenarioId),
    });
}
