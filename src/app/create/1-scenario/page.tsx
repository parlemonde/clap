import * as React from 'react';

import { ScenarioCard } from '@frontend/components/create/ScenarioCard';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { Trans } from '@frontend/components/ui/Trans';
import type { ServerPageProps } from '@lib/page-props.types';
import { getThemeId } from '@lib/search-params/get-theme-id';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { getCurrentUser } from '@server/auth/get-current-user';
import { getTranslation } from '@server-actions/get-translation';
import { listScenarios } from '@server-actions/scenarios/list-scenarios';

import { Scenarios } from './Scenarios';

const getScenarios = async (themeId: number, userId: string | undefined, questionLanguageCode: string) => {
    if (themeId === -1 || Number.isNaN(themeId) || !Number.isFinite(themeId)) {
        return [];
    }
    const scenarios = await listScenarios({ themeId: Number(themeId), userId, questionLanguageCode });
    return scenarios.filter((s) => s.names[questionLanguageCode] !== undefined || s.isDefault === false);
};

export default async function ScenarioPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const themeId = getThemeId(searchParams);
    const { t, currentLocale } = await getTranslation();
    const user = await getCurrentUser();

    if (user?.role === 'student') {
        return null;
    }

    const scenarios = await getScenarios(Number(themeId), user?.id, currentLocale);

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={themeId}></ThemeBreadcrumbs>
            <Steps activeStep={0} themeId={themeId}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>1</Inverted>{' '}
                <Trans i18nKey="1_scenario_page.header.title">
                    Quel <Inverted>scénario</Inverted> choisir ?
                </Trans>
            </Title>
            <Title color="inherit" variant="h2" marginBottom="md">
                {t('1_scenario_page.secondary.title')}
            </Title>
            <ScenarioCard
                isNew
                name={t('1_scenario_page.new_scenario_card.name')}
                description={t('1_scenario_page.new_scenario_card.desc')}
                href={`/create/1-scenario/new${serializeToQueryUrl({ themeId })}`}
            />
            <Scenarios scenarios={scenarios.filter((s) => s.names[currentLocale] !== undefined || s.isDefault === false)} themeId={themeId} />
        </Container>
    );
}
