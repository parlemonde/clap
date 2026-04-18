import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { Trans } from '@frontend/components/ui/Trans';
import type { ServerPageProps } from '@lib/page-props.types';
import { getThemeId } from '@lib/search-params/get-theme-id';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';

import { NewScenarioForm } from './newScenarioForm';

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
                <Trans i18nKey="1_new_scenario_page.header.title">
                    Crée ton nouveau <Inverted>scénario</Inverted> !
                </Trans>
            </Title>
            <NewScenarioForm backUrl={backUrl} themeId={themeId} />
        </Container>
    );
}
