import { getTranslations } from 'next-intl/server';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import type { ServerPageProps } from '@lib/page-props.types';
import { getThemeId } from '@lib/search-params/get-theme-id';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';

import { NewScenarioForm } from './newScenarioForm';

export default async function ScenarioPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const themeId = getThemeId(searchParams);
    const backUrl = `/create/1-scenario${serializeToQueryUrl({ themeId })}`;
    const t = await getTranslations();

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={themeId}></ThemeBreadcrumbs>
            <Steps activeStep={0} themeId={themeId} backHref={backUrl}></Steps>
            <Title color="primary" marginY="md" variant="h1">
                <Inverted isRound>1</Inverted>{' '}
                {t.rich('1_new_scenario_page.header.title', {
                    inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                })}
            </Title>
            <NewScenarioForm backUrl={backUrl} themeId={themeId} />
        </Container>
    );
}
