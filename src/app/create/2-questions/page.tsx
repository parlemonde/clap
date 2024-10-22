import * as React from 'react';

import { PageWithProject } from './PageWithProject';
import { getTranslation } from 'src/actions/get-translation';
import { listQuestionsTemplates } from 'src/actions/questions-templates/list-questions-templates';
import { getScenarioId } from 'src/utils/search-params/get-scenario-id';
import { getThemeId } from 'src/utils/search-params/get-theme-id';
import type { SearchParams } from 'src/utils/search-params/search-params.types';

export default async function ScenarioPage({ searchParams }: { searchParams: SearchParams }) {
    const themeId = getThemeId(searchParams);
    const scenarioId = getScenarioId(searchParams);
    const { currentLocale } = await getTranslation();
    const defaultQuestions = typeof scenarioId === 'number' ? await listQuestionsTemplates(scenarioId, currentLocale) : [];

    return <PageWithProject themeId={themeId} scenarioId={scenarioId} defaultQuestions={defaultQuestions} />;
}
