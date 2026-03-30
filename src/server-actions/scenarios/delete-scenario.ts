'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@server/database';
import { scenarios } from '@server/database/schemas/scenarios';

import { getCurrentUser } from '@server-actions/get-current-user';

export async function deleteScenario(scenarioId: number) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.delete(scenarios).where(eq(scenarios.id, scenarioId));
    revalidatePath('/');
    revalidatePath('/admin/scenarios');
}
