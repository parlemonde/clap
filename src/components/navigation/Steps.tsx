import { useRouter } from 'next/router';
import React from 'react';

import { Box, MobileStepper, Step, StepLabel, Stepper } from '@mui/material';

import { ProjectTitle } from 'src/components/ProjectTitle';
import { BackButton } from 'src/components/navigation/BackButton';
import { projectContext } from 'src/contexts/projectContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';

type StepData = {
    name: string;
    href: (args: { themeId?: string | number; projectId?: string | number }) => string;
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
export const Steps = ({ activeStep, themeId, scenarioName, backHref }: StepsProps) => {
    const router = useRouter();
    const { t } = useTranslation();
    const { project } = React.useContext(projectContext);
    const projectId = project ? project.id : undefined;

    return (
        <div>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                {activeStep > 0 && <ProjectTitle />}
                <Stepper sx={{ padding: '24px 0' }} activeStep={activeStep} alternativeLabel>
                    {STEPS.map((step, index) => (
                        <Step
                            key={step.name}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                if (index === activeStep && backHref) {
                                    router.push(backHref);
                                }
                                if (index < activeStep) {
                                    router.push(step.href({ themeId, projectId }));
                                }
                            }}
                        >
                            <StepLabel>{index === 0 && scenarioName ? scenarioName : t(step.name)}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <MobileStepper
                    sx={{
                        position: 'relative',
                        margin: '1rem 0',
                        justifyContent: 'center',
                        '& .MuiMobileStepper-dot': {
                            backgroundColor: 'white',
                            border: '1px solid',
                            borderColor: (theme) => theme.palette.secondary.main,
                            width: '13px',
                            height: '13px',
                            margin: '0 4px',
                        },
                        '& .MuiMobileStepper-dotActive': { backgroundColor: (theme) => theme.palette.secondary.main },
                    }}
                    variant="dots"
                    steps={STEPS.length}
                    position="top"
                    activeStep={activeStep}
                    backButton={
                        <BackButton
                            href={backHref ? backHref : activeStep === 0 ? '/create' : STEPS[activeStep - 1].href({ themeId, projectId })}
                            style={{ position: 'absolute', margin: 0, left: 0 }}
                        />
                    }
                    nextButton={null}
                />
            </Box>
        </div>
    );
};
