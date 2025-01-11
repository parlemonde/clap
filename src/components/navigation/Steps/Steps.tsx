'use client';

import { ChevronLeftIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import Link from 'next/link';
import * as React from 'react';

import styles from './steps.module.scss';
import { Button } from 'src/components/layout/Button';
import { Text } from 'src/components/layout/Typography';
import { useTranslation } from 'src/contexts/translationContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { serializeToQueryUrl } from 'src/lib/serialize-to-query-url';

type StepData = {
    name: string;
    href: string | ((themeId?: number | string | null) => string);
};

const STEPS: StepData[] = [
    {
        name: 'step1',
        href: (themeId) => `/create/1-scenario${serializeToQueryUrl({ themeId })}`,
    },
    {
        name: 'step2',
        href: '/create/2-questions',
    },
    {
        name: 'step3',
        href: '/create/3-storyboard',
    },
    {
        name: 'step4',
        href: '/create/4-pre-mounting',
    },
    {
        name: 'step5',
        href: '/create/5-music',
    },
    {
        name: 'step6',
        href: '/create/6-result',
    },
];

type StepsProps = {
    activeStep: number;
    themeId?: string | number | null;
    backHref?: string;
};
export const Steps = ({ activeStep, backHref, themeId }: StepsProps) => {
    const { t } = useTranslation();
    const [project] = useCurrentProject();

    return (
        <>
            {/* -- Step Title (Desktop only) -- */}
            {/* {activeStep > 0 && <ProjectTitle />} */}

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
                                    {t(step.name)}
                                </Text>
                            </div>
                        </>
                    );

                    let href: string | undefined = undefined;
                    if (index === activeStep && backHref) {
                        href = backHref;
                    } else if (typeof step.href === 'function') {
                        href = step.href(themeId);
                    } else if (project && project.themeId === themeId) {
                        href = step.href;
                    }
                    if (href) {
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
                    <Link href={backHref} passHref legacyBehavior>
                        <Button
                            as="a"
                            leftIcon={<ChevronLeftIcon />}
                            className={styles.mobileBackButton}
                            label={t('back')}
                            color="primary"
                            variant="borderless"
                        />
                    </Link>
                )}
                {STEPS.map((step, index) => (
                    <div key={step.name} className={classNames(styles.dot, { [styles['dot--active']]: index <= activeStep })}></div>
                ))}
            </div>
        </>
    );
};
