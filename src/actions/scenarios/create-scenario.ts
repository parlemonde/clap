'use server';

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
    const currentLocale = cookies().get('app-language')?.value || 'fr';
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

    // Return new theme
    return newScenarios[0];
}
