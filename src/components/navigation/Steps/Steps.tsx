import { ChevronLeftIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import styles from './steps.module.scss';
import { Button } from 'src/components/layout/Button';
import { Text } from 'src/components/layout/Typography';
import { userContext } from 'src/contexts/userContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { UserType } from 'types/models/user.type';

type StepData = {
    name: string;
    href: (args: { themeId?: string | number; projectId?: number | null }) => string;
    active: boolean;
};

type StepsProps = {
    activeStep: number;
    themeId?: string | number;
    scenarioName?: string;
    backHref?: string;
};
export const Steps = ({ activeStep, backHref, themeId }: StepsProps) => {
    const { t } = useTranslation();
    const { project } = useCurrentProject();
    const projectId = project ? project.id : undefined;
    const router = useRouter();

    const { user } = React.useContext(userContext);
    const isStudent = user?.type === UserType.STUDENT;

    const STEPS: StepData[] = [
        {
            name: 'step1',
            href: ({ themeId }) => `/create/1-scenario${serializeToQueryUrl({ themeId })}`,
            active: !isStudent,
        },
        {
            name: 'step2',
            href: ({ projectId }) => `/create/2-questions${serializeToQueryUrl({ projectId })}`,
            active: !isStudent,
        },
        {
            name: 'step3',
            href: ({ projectId }) => `/create/3-storyboard${serializeToQueryUrl({ projectId })}`,
            active: true,
        },
        {
            name: 'step4',
            href: ({ projectId }) => `/create/4-pre-mounting${serializeToQueryUrl({ projectId })}`,
            active: true,
        },
        {
            name: 'step5',
            href: ({ projectId }) => `/create/5-music${serializeToQueryUrl({ projectId })}`,
            active: !isStudent,
        },
        {
            name: 'step6',
            href: ({ projectId }) => `/create/6-result${serializeToQueryUrl({ projectId })}`,
            active: !isStudent,
        },
    ];

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
                    if (href && step.active) {
                        const onClick = () => {
                            if (['step1'].includes(step.name)) {
                                if (confirm(t('validation_return_back'))) {
                                    router.push(href);
                                }
                                return;
                            }
                            router.push(href);
                        };

                        return (
                            <a key={step.name} className={styles.step} onClick={onClick}>
                                {stepContent}
                            </a>
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
