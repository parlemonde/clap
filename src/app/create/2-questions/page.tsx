import * as React from 'react';

import { getTranslation } from 'src/actions/get-translation';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { getScenarioId } from 'src/utils/search-params/get-scenario-id';
import { getThemeId } from 'src/utils/search-params/get-theme-id';
import type { SearchParams } from 'src/utils/search-params/search-params.types';

export default async function ScenarioPage({ searchParams }: { searchParams: SearchParams }) {
    const themeId = getThemeId(searchParams);
    const scenarioId = getScenarioId(searchParams);
    const { t } = await getTranslation();

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={themeId}></ThemeBreadcrumbs>
            <Steps activeStep={1} themeId={themeId} scenarioName={'FOO'}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>2</Inverted>{' '}
                <Trans i18nKey="part2_title">
                    Mes <Inverted>séquences</Inverted>
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('part2_desc')}
            </Title>
            TODO: {scenarioId}
        </Container>
    );
}
