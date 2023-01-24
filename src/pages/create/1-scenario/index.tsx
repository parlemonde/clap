import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Typography } from '@mui/material';

import { useScenarios } from 'src/api/scenarios/scenarios.list';
import { useTheme } from 'src/api/themes/themes.get';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { useQueryId } from 'src/utils/useQueryId';

type ScenarioCardProps = {
    isNew?: boolean;
    name: string;
    description?: string;
    questionsCount?: string;
    href: string;
};
const ScenarioCard = ({ isNew = false, name, description, questionsCount, href }: ScenarioCardProps) => (
    <Link href={href} passHref>
        <Box
            component="a"
            sx={{
                borderColor: (theme) => theme.palette.secondary.main,
            }}
            className="scenario-card"
            tabIndex={0}
            style={isNew ? { backgroundColor: '#f0fafa' } : {}}
        >
            <Typography color="primary" variant="h3">
                {name}
            </Typography>
            <p>{description}</p>
            {questionsCount && (
                <Box component="div" style={{ color: '#646464' }}>
                    {questionsCount}
                </Box>
            )}
            <div className="scenario-card__arrow">{<ArrowForwardIosIcon sx={{ color: '#646464' }} />}</div>
        </Box>
    </Link>
);

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
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps activeStep={0} themeId={themeId}></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>1</Inverted>{' '}
                    <Trans i18nKey="part1_title">
                        Quel <Inverted>scénario</Inverted> choisir ?
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part1_subtitle2')}
                </Typography>
                <ScenarioCard
                    isNew
                    name={t('new_scenario_card_title')}
                    description={t('new_scenario_card_desc')}
                    href={`/create/1-scenario/new${serializeToQueryUrl({ themeId })}`}
                />
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
            </div>
        </div>
    );
};

export default ScenarioPage;
