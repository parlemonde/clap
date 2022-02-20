import { useRouter } from 'next/router';
import React from 'react';

import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MobileStepper from '@mui/material/MobileStepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

import { ProjectTitle } from './ProjectTitle';
import type { tFunction } from 'src/i18n/translateFunction';
import { useTranslation } from 'src/i18n/useTranslation';
import { ProjectServiceContext } from 'src/services/useProject';
import { getQueryString } from 'src/util';
import type { Project } from 'types/models/project.type';

const steps = [
    {
        name: (t: tFunction, activeStep: number, project: Project) => (activeStep > 0 ? project.scenario?.name || t('step1') : t('step1')),
        back: (project: Project) => `/create/1-scenario-choice?themeId=${project.theme?.id || 0}`,
    },
    {
        name: (t: tFunction) => t('step2'),
        back: () => '/create/2-questions-choice',
    },
    {
        name: (t: tFunction) => t('step3'),
        back: () => '/create/3-storyboard-and-filming-schedule',
    },
    {
        name: (t: tFunction) => t('step4'),
        back: () => '/create',
    },
];

interface StepsProps {
    activeStep: number;
}

export const Steps: React.FunctionComponent<StepsProps> = ({ activeStep }: StepsProps) => {
    const router = useRouter();
    const { t } = useTranslation();
    const { project } = React.useContext(ProjectServiceContext);
    const [isNewPage, setIsNewPage] = React.useState(false);
    const [isDrawPage, setIsDrawPage] = React.useState(false);

    React.useEffect(() => {
        setIsNewPage(router.pathname.indexOf('new') !== -1 || router.pathname.indexOf('edit') !== -1);
        setIsDrawPage(router.pathname.indexOf('draw') !== -1);
    }, [router.pathname]);

    const handleBack = (index: number) => (event: React.MouseEvent) => {
        event.preventDefault();
        if (index < 0) {
            router.push('/create');
        } else if (index === 2 && isDrawPage) {
            const questionIndex = parseInt(getQueryString(router.query.question)) || 0;
            const planIndex = parseInt(getQueryString(router.query.plan)) || 0;
            router.push(`/create/3-storyboard-and-filming-schedule/edit?question=${questionIndex}&plan=${planIndex}`);
        } else if (index < activeStep || (index === activeStep && isNewPage)) {
            router.push(steps[index].back(project));
        }
    };

    const handleProjectTitleClick = () => {
        router.push(`/my-videos/${project.id}`);
    };

    return (
        <div>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                {activeStep > 0 && <ProjectTitle onClick={handleProjectTitleClick} />}
                <Stepper sx={{ padding: '24px 0' }} activeStep={activeStep} alternativeLabel>
                    {steps.map((step, index) => (
                        <Step key={step.name(t, activeStep, project)} style={{ cursor: 'pointer' }} onClick={handleBack(index)}>
                            <StepLabel>{step.name(t, activeStep, project)}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <MobileStepper
                    sx={{
                        position: 'relative',
                        margin: '1rem 0',
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
                    steps={steps.length}
                    position="top"
                    activeStep={activeStep}
                    backButton={
                        <Button size="medium" onClick={handleBack(isNewPage || isDrawPage ? activeStep : activeStep - 1)} className="back-button">
                            <KeyboardArrowLeft />
                            {t('back')}
                        </Button>
                    }
                    nextButton={null}
                />
                {activeStep > 0 && <ProjectTitle onClick={handleProjectTitleClick} smaller />}
            </Box>
        </div>
    );
};
