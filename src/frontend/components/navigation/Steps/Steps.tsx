'use client';

import { ChevronLeftIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Text } from '@frontend/components/layout/Typography';
import { Link } from '@frontend/components/navigation/Link';
import { userContext } from '@frontend/contexts/userContext';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';

import { ProjectTitle } from './ProjectTitle';
import styles from './steps.module.css';

type StepData = {
    name: 'scenario' | 'questions' | 'storyboard' | 'pre-mounting' | 'music' | 'downloads';
    href: string | ((themeId?: number | string | null) => string);
};

const STEPS: StepData[] = [
    {
        name: 'scenario',
        href: (themeId) => `/create/1-scenario${serializeToQueryUrl({ themeId })}`,
    },
    {
        name: 'questions',
        href: '/create/2-questions',
    },
    {
        name: 'storyboard',
        href: '/create/3-storyboard',
    },
    {
        name: 'pre-mounting',
        href: '/create/4-pre-mounting',
    },
    {
        name: 'music',
        href: '/create/5-music',
    },
    {
        name: 'downloads',
        href: '/create/6-result',
    },
];

type StepsProps = {
    activeStep: number;
    themeId?: string | number | null;
    backHref?: string;
};
export const Steps = ({ activeStep, backHref, themeId }: StepsProps) => {
    const t = useExtracted('Steps');
    const commonT = useExtracted('common');
    const { projectData } = useCurrentProject();
    const user = React.useContext(userContext);

    const isStudent = user?.role === 'student';
    const getStepLabel = React.useCallback(
        (name: StepData['name']) => {
            switch (name) {
                case 'scenario':
                    return t('Choix du scénario');
                case 'questions':
                    return t('Choix des séquences');
                case 'storyboard':
                    return t('Storyboard');
                case 'pre-mounting':
                    return t('Prémontage');
                case 'music':
                    return t('Musique');
                case 'downloads':
                    return t('Téléchargements');
            }
        },
        [t],
    );

    return (
        <>
            {/* -- Step Title (Desktop only) -- */}
            {activeStep > 0 && !isStudent && <ProjectTitle />}

            {/* -- Steps (Desktop only) -- */}
            <div className={styles.steps}>
                {STEPS.map((step, index) => {
                    const stepContent = (
                        <>
                            <div className={styles.stepNumberWrapper}>
                                <span
                                    className={classNames(styles.stepLine, {
                                        [styles['stepLine--is-hidden']]: index === 0,
                                        [styles['stepLine--is-done']]: index !== 0 && index <= activeStep,
                                    })}
                                />
                                <span className={classNames(styles.stepNumber, { [styles['stepNumber--is-done']]: index <= activeStep })}>
                                    {index + 1}
                                </span>
                                <span
                                    className={classNames(styles.stepLine, {
                                        [styles['stepLine--is-hidden']]: index === STEPS.length - 1,
                                        [styles['stepLine--is-done']]: index !== STEPS.length - 1 && index < activeStep,
                                    })}
                                />
                            </div>
                            <div>
                                <Text className={classNames(styles.stepText, { [styles['stepText--is-done']]: index <= activeStep })}>
                                    {getStepLabel(step.name)}
                                </Text>
                            </div>
                        </>
                    );

                    let href: string | undefined = undefined;
                    if (index === activeStep && backHref) {
                        href = backHref;
                    } else if (typeof step.href === 'function') {
                        href = step.href(themeId);
                    } else if (projectData && projectData.themeId === themeId) {
                        href = step.href;
                    }
                    if (href && (!isStudent || index === 2 || index === 3)) {
                        return (
                            <Link href={href} key={step.name} className={styles.step}>
                                {stepContent}
                            </Link>
                        );
                    }
                    return (
                        <div className={styles.step} key={step.name}>
                            {stepContent}
                        </div>
                    );
                })}
            </div>

            {/* -- Steps (mobile only) -- */}
            <div className={styles.mobileSteps}>
                {backHref && (
                    <Button
                        as="a"
                        href={backHref}
                        leftIcon={<ChevronLeftIcon />}
                        className={styles.mobileBackButton}
                        label={commonT('Retour')}
                        color="primary"
                        variant="borderless"
                    />
                )}
                {STEPS.map((step, index) => (
                    <div key={step.name} className={classNames(styles.dot, { [styles['dot--active']]: index <= activeStep })}></div>
                ))}
            </div>
        </>
    );
};
