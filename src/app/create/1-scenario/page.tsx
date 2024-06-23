import * as React from 'react';

import { getTranslation } from 'src/actions/get-translation';
import { getTheme } from 'src/actions/themes/get-theme';
import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs, ThemeBreadcrumbsPlaceholder } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { serializeToQueryUrl } from 'src/utils/serialize-to-query-url';

type ThemeBreadcrumbsWithThemeProps = {
    themeId: string;
};
const ThemeBreadcrumbsWithTheme = async ({ themeId }: ThemeBreadcrumbsWithThemeProps) => {
    const isLocalTheme = themeId.startsWith('local_');
    const theme = isLocalTheme ? undefined : await getTheme(Number(themeId) ?? -1);

    return <ThemeBreadcrumbs theme={theme} themeId={themeId}></ThemeBreadcrumbs>;
};

export default async function ScenarioPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const { t, currentLocale } = await getTranslation();
    const themeId = typeof searchParams.themeId === 'string' ? searchParams.themeId : '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scenarios: any[] = []; // TODO

    const getQuestionCountString = (questionsCounts: Record<string, number> = {}) => {
        const count = questionsCounts[currentLocale] || questionsCounts.fr || 0;
        if (count) {
            return t('step', { count });
        }
        return undefined;
    };

    return (
        <Container paddingBottom="xl">
            <React.Suspense fallback={<ThemeBreadcrumbsPlaceholder />}>
                <ThemeBreadcrumbsWithTheme themeId={themeId}></ThemeBreadcrumbsWithTheme>
            </React.Suspense>
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
            {/* TODO: use suspense for db scenarios and display local scenarios */}
            {scenarios
                .filter((s) => s.names[currentLocale] !== undefined || s.isDefault === false)
                .map((s) => (
                    <ScenarioCard
                        key={s.id}
                        name={s.names[currentLocale] || s.names[Object.keys(s.names)[0]] || ''}
                        description={s.descriptions[currentLocale] || s.descriptions[Object.keys(s.descriptions)[0]] || ''}
                        questionsCount={getQuestionCountString(s.questionsCount)}
                        href={`/create/2-questions${serializeToQueryUrl({ themeId, scenarioId: s.id })}`}
                    />
                ))}
        </Container>
    );
}
