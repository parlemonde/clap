import * as React from 'react';

import { PageWithProject } from './PageWithProject';
import { getTranslation } from 'src/actions/get-translation';
import { listQuestionsTemplates } from 'src/actions/questions-templates/list-questions-templates';
import type { ServerPageProps } from 'src/utils/page-props.types';
import { getScenarioId } from 'src/utils/search-params/get-scenario-id';
import { getThemeId } from 'src/utils/search-params/get-theme-id';

export default async function ScenarioPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const themeId = getThemeId(searchParams);
    const scenarioId = getScenarioId(searchParams);
    const { currentLocale } = await getTranslation();
    const defaultQuestions = typeof scenarioId === 'number' ? await listQuestionsTemplates(scenarioId, currentLocale) : [];

    return <PageWithProject themeId={themeId} scenarioId={scenarioId} defaultQuestions={defaultQuestions} />;
}
