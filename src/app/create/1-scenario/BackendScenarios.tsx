import * as React from 'react';

import { Scenarios } from './Scenarios';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { listScenarios } from 'src/actions/scenarios/list-scenarios';

interface BackendScenariosProps {
    themeId: number;
}
export const BackendScenarios = async ({ themeId }: BackendScenariosProps) => {
    const { currentLocale } = await getTranslation();

    if (themeId === -1 || Number.isNaN(themeId) || !Number.isFinite(themeId)) {
        return null;
    }
    const user = await getCurrentUser();
    const scenarios = await listScenarios({ themeId: Number(themeId), userId: user?.id });

    return <Scenarios scenarios={scenarios.filter((s) => s.names[currentLocale] !== undefined || s.isDefault === false)} />;
};
