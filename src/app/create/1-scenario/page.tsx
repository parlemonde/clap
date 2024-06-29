import * as React from 'react';

import { LocalScenarios } from './LocalScenarios';
import { Scenarios } from './Scenarios';
import { getTranslation } from 'src/actions/get-translation';
import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { ScenarioCardPlaceholder } from 'src/components/create/ScenarioCard/ScenarioCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { getThemeId } from 'src/utils/search-params/get-theme-id';
import type { SearchParams } from 'src/utils/search-params/search-params.types';
import { serializeToQueryUrl } from 'src/utils/serialize-to-query-url';

export default async function ScenarioPage({ searchParams }: { searchParams: SearchParams }) {
    const themeId = getThemeId(searchParams);
    const { t } = await getTranslation();

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={themeId}></ThemeBreadcrumbs>
            <Steps activeStep={0} themeId={themeId}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>1</Inverted>{' '}
                <Trans i18nKey="part1_title">
                    Quel <Inverted>scénario</Inverted> choisir ?
                </Trans>
            </Title>
            <Title color="inherit" variant="h2" marginBottom="md">
                {t('part1_subtitle2')}
            </Title>
            <ScenarioCard
                isNew
                name={t('new_scenario_card_title')}
                description={t('new_scenario_card_desc')}
                href={`/create/1-scenario/new${serializeToQueryUrl({ themeId })}`}
            />
            {typeof themeId === 'number' && (
                <React.Suspense fallback={<ScenarioCardPlaceholder />}>
                    <Scenarios themeId={themeId}></Scenarios>
                </React.Suspense>
            )}
            <LocalScenarios themeId={themeId}></LocalScenarios>
        </Container>
    );
}
