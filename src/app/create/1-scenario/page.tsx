import * as React from 'react';

import { Scenarios } from './Scenarios';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { listScenarios } from 'src/actions/scenarios/list-scenarios';
import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import type { ServerPageProps } from 'src/lib/page-props.types';
import { getThemeId } from 'src/lib/search-params/get-theme-id';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';

const getScenarios = async (themeId: number, userId: number | undefined, questionLanguageCode: string) => {
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
