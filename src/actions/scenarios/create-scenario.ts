'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import type { Scenario } from 'src/database/schemas/scenarios';
import { scenarios } from 'src/database/schemas/scenarios';

// User action to create a new scenario
type NewUserScenario = {
    name: string;
    description: string;
    themeId: number;
};
export async function createScenario(newUserScenario: NewUserScenario): Promise<Scenario | undefined> {
    const cookieStore = await cookies();
    const currentLocale = cookieStore.get('app-language')?.value || 'fr';
    const user = await getCurrentUser();
    if (!user) {
        return;
    }

    const newScenarios = await db
        .insert(scenarios)
        .values({
            names: {
                [currentLocale]: newUserScenario.name,
            },
            descriptions: {
                [currentLocale]: newUserScenario.description,
            },
            userId: user.id,
            themeId: newUserScenario.themeId,
        })
        .returning();

    // Return new scenario
    revalidatePath('/');
    revalidatePath('/admin/scenarios');
    return newScenarios[0];
}

type NewAdminScenario = {
    names: Record<string, string>;
    descriptions: Record<string, string>;
    themeId: number;
};
export async function createAdminScenario(newScenario: NewAdminScenario): Promise<Scenario | undefined> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    const newScenarios = await db
        .insert(scenarios)
        .values({
            ...newScenario,
            isDefault: true,
        })
        .returning();

    // Return new scenario
    revalidatePath('/');
    revalidatePath('/admin/scenarios');
    return newScenarios[0];
}
