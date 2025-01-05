'use client';

import * as React from 'react';

import { DiaporamaPlayer } from 'src/components/create/DiaporamaPlayer';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useDeepMemo } from 'src/hooks/useDeepMemo';
import { getSounds } from 'src/lib/get-sounds';

export default function ResultPage() {
    const { t } = useTranslation();
    const [project] = useCurrentProject();

    const sounds = useDeepMemo(getSounds(project?.questions || []));

    if (!project) {
        return null;
    }

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={5} themeId={project.themeId}></Steps>
            <Title color="primary" variant="h1" marginY="md">
                <Inverted isRound>6</Inverted>
                <Trans i18nKey="part6_title">
                    À votre <Inverted>caméra</Inverted> !
                </Trans>
            </Title>
            <Title color="inherit" variant="h2">
                {t('part6_subtitle1')}
            </Title>
            <div style={{ margin: '16px 0' }}>
                <DiaporamaPlayer
                    questions={project.questions}
                    soundUrl={project.soundUrl || ''}
                    volume={project.soundVolume || 100}
                    setVolume={() => {}}
                    soundBeginTime={project.soundBeginTime || 0}
                    setSoundBeginTime={() => {}}
                    sounds={sounds}
                />
            </div>
        </Container>
    );
}
