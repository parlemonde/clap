'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@server/database';
import type { Scenario } from '@server/database/schemas/scenarios';
import { scenarios } from '@server/database/schemas/scenarios';

import { getCurrentUser } from '@server-actions/get-current-user';

export async function updateScenario(scenarioId: number, updatedScenario: Pick<Scenario, 'descriptions' | 'names' | 'themeId'>) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.update(scenarios).set(updatedScenario).where(eq(scenarios.id, scenarioId));

    revalidatePath('/');
    revalidatePath('/admin/scenarios');
}
