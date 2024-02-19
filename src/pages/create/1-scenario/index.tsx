import { useRouter } from 'next/router';
import React from 'react';

import { useScenarios } from 'src/api/scenarios/scenarios.list';
import { useTheme } from 'src/api/themes/themes.get';
import { ScenarioCard } from 'src/components/create/ScenarioCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { useQueryId } from 'src/utils/useQueryId';

const ScenarioPage = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const themeId = useQueryId('themeId');
    const { theme, isLoading: isThemeLoading } = useTheme(themeId);
    const { scenarios } = useScenarios({ isDefault: true, self: true, themeId });

    React.useEffect(() => {
        if (!theme && !isThemeLoading) {
            router.replace('/create');
        }
    }, [router, theme, isThemeLoading]);

    const getQuestionCountString = (questionsCounts: Record<string, number> = {}) => {
        const count = questionsCounts[currentLocale] || questionsCounts.fr || 0;
        if (count) {
            return t('step', { count });
        }
        return undefined;
    };

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps activeStep={0} themeId={themeId}></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '32px' }}>
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
                {scenarios
                    .filter((s) => s.names[currentLocale] !== undefined || s.isDefault === false)
                    .map((s) => (
                        s.names[currentLocale].trim().length > 0 &&
                        <ScenarioCard
                            key={s.id}
                            name={s.names[currentLocale] || s.names[Object.keys(s.names)[0]] || ''}
                            description={s.descriptions[currentLocale] || s.descriptions[Object.keys(s.descriptions)[0]] || ''}
                            questionsCount={getQuestionCountString(s.questionsCount)}
                            href={`/create/2-questions${serializeToQueryUrl({ themeId, scenarioId: s.id })}`}
                        />
                    ))}
            </div>
        </Container>
    );
};

export default ScenarioPage;
