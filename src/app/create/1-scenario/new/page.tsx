import * as React from 'react';

import { NewScenarioForm } from './newScenarioForm';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import type { ServerPageProps } from 'src/utils/page-props.types';
import { getThemeId } from 'src/utils/search-params/get-theme-id';
import { serializeToQueryUrl } from 'src/utils/serialize-to-query-url';

export default async function ScenarioPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const themeId = getThemeId(searchParams);
    const backUrl = `/create/1-scenario${serializeToQueryUrl({ themeId })}`;

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={themeId}></ThemeBreadcrumbs>
            <Steps activeStep={0} themeId={themeId} backHref={backUrl}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>1</Inverted>{' '}
                <Trans i18nKey="new_scenario_title">
                    Crée ton nouveau <Inverted>scénario</Inverted> !
                </Trans>
            </Title>
            <NewScenarioForm backUrl={backUrl} themeId={themeId} />
        </Container>
    );
}
