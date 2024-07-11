'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { scenarios } from 'src/database/schemas/scenarios';

export async function deleteScenario(scenarioId: number) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.delete(scenarios).where(eq(scenarios.id, scenarioId));
    revalidatePath('/');
    revalidatePath('/admin/scenarios');
}
