import * as React from 'react';

import { BackendScenarios } from './BackendScenarios';
import { LocalScenarios } from './LocalScenarios';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { ScenarioCardPlaceholder } from 'src/components/create/ScenarioCard/ScenarioCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import type { ServerPageProps } from 'src/lib/page-props.types';
import { getThemeId } from 'src/lib/search-params/get-theme-id';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';

export default async function ScenarioPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const themeId = getThemeId(searchParams);
    const { t } = await getTranslation();
    const user = await getCurrentUser();

    if (user?.role === 'student') {
        return null;
    }

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
            {typeof themeId === 'number' ? (
                <React.Suspense fallback={<ScenarioCardPlaceholder />}>
                    <>
                        <ScenarioCard
                            isNew
                            name={t('new_scenario_card_title')}
                            description={t('new_scenario_card_desc')}
                            href={`/create/1-scenario/new${serializeToQueryUrl({ themeId })}`}
                        />
                        <BackendScenarios themeId={themeId}></BackendScenarios>
                        <LocalScenarios themeId={themeId}></LocalScenarios>
                    </>
                </React.Suspense>
            ) : (
                <>
                    <ScenarioCard
                        isNew
                        name={t('new_scenario_card_title')}
                        description={t('new_scenario_card_desc')}
                        href={`/create/1-scenario/new${serializeToQueryUrl({ themeId })}`}
                    />
                    <LocalScenarios themeId={themeId}></LocalScenarios>
                </>
            )}
        </Container>
    );
}
