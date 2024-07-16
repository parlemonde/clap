'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import type { Scenario } from 'src/database/schemas/scenarios';
import { scenarios } from 'src/database/schemas/scenarios';

export async function updateScenario(scenarioId: number, updatedScenario: Pick<Scenario, 'descriptions' | 'names' | 'themeId'>) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.update(scenarios).set(updatedScenario).where(eq(scenarios.id, scenarioId));

    revalidatePath('/');
    revalidatePath('/admin/scenarios');
}
