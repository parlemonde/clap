import { ChevronLeftIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import Link from 'next/link';
import * as React from 'react';

import styles from './steps.module.scss';
import { getTranslation } from 'src/actions/get-translation';
import { Button } from 'src/components/layout/Button';
import { Text } from 'src/components/layout/Typography';
import { serializeToQueryUrl } from 'src/utils/serialize-to-query-url';

type StepData = {
    name: string;
    href: (args: { themeId?: string | number; projectId?: number | null }) => string;
};

const STEPS: StepData[] = [
    {
        name: 'step1',
        href: ({ themeId }) => `/create/1-scenario${serializeToQueryUrl({ themeId })}`,
    },
    {
        name: 'step2',
        href: ({ projectId }) => `/create/2-questions${serializeToQueryUrl({ projectId })}`,
    },
    {
        name: 'step3',
        href: ({ projectId }) => `/create/3-storyboard${serializeToQueryUrl({ projectId })}`,
    },
    {
        name: 'step4',
        href: ({ projectId }) => `/create/4-pre-mounting${serializeToQueryUrl({ projectId })}`,
    },
    {
        name: 'step5',
        href: ({ projectId }) => `/create/5-music${serializeToQueryUrl({ projectId })}`,
    },
    {
        name: 'step6',
        href: ({ projectId }) => `/create/6-result${serializeToQueryUrl({ projectId })}`,
    },
];

type StepsProps = {
    activeStep: number;
    themeId?: string | number;
    scenarioName?: string;
    backHref?: string;
};
export const Steps = async ({ activeStep, backHref, themeId }: StepsProps) => {
    const { t } = await getTranslation();
    // const { project } = useCurrentProject();
    // const projectId = project ? project.id : undefined;
    const projectId = undefined;

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
                    const href =
                        index === activeStep && backHref
                            ? backHref
                            : activeStep !== 0
                            ? step.href({ themeId, projectId: projectId || null })
                            : undefined;
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
