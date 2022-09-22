import { useRouter } from 'next/router';
import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogContentText from '@mui/material/DialogContentText';
import Typography from '@mui/material/Typography';

import { Inverted } from 'src/components/Inverted';
import { Modal } from 'src/components/Modal';
import { Trans } from 'src/components/Trans';
import { Scene } from 'src/components/create/Scene';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { UserServiceContext } from 'src/services/UserService';
import { usePlanRequests } from 'src/services/usePlans';
import { ProjectServiceContext } from 'src/services/useProject';
import { getQuestions } from 'src/util';
import type { Plan } from 'types/models/plan.type';
import type { Question } from 'types/models/question.type';
import type { Title } from 'types/models/title.type';

const PlanAll: React.FunctionComponent = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { isLoggedIn } = React.useContext(UserServiceContext);
    const { project, updateProject } = React.useContext(ProjectServiceContext);
    const { addPlan, deletePlan, addTitle, deleteTitle } = usePlanRequests();
    const [deleteIndexes, setDeleteIndexes] = React.useState<{ questionIndex: number; planIndex: number; showNumber: number } | null>(null);

    const questions = getQuestions(project);

    const handleNext = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/4-pre-mounting`);
    };

    const updateQuestion = (index: number, newQuestion: Partial<Question>) => {
        const questions = project.questions || [];
        const prevQuestion = questions[index];
        questions[index] = { ...prevQuestion, ...newQuestion };
        updateProject({ questions });
    };

    const handleAddPlan = (index: number) => async (event: React.MouseEvent) => {
        event.preventDefault();
        const plans = questions[index].plans || [];
        let plan: Plan | null = null;
        if (isLoggedIn && project !== null && project.id !== -1 && project.id !== null) {
            plan = await addPlan(questions[index].id, plans.length);
        } else {
            plan = {
                id: 0,
                index: plans.length,
                description: '',
                image: null,
                url: null,
                duration: 3000,
            };
        }
        if (plan === null) {
            return;
        }
        plans.push(plan);
        updateQuestion(index, { plans });
    };

    const handleDeletePlan = (questionIndex: number) => (planIndex: number) => async (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const plans = questions[questionIndex].plans || [];
        await deletePlan(plans[planIndex].id);
        setDeleteIndexes({
            questionIndex,
            planIndex,
            showNumber: (questions[questionIndex].planStartIndex || 0) + planIndex,
        });
    };

    const handleAddTitle = (index: number) => async (event: React.MouseEvent) => {
        event.preventDefault();
        if (questions[index].title == null) {
            let title: Title | null = null;
            if (isLoggedIn && project !== null && project.id !== -1 && project.id !== null) {
                title = await addTitle(questions[index].id);
            } else {
                title = {
                    id: 0,
                    text: '',
                    style: '',
                    duration: 0,
                };
            }
            if (title === null) {
                return;
            }
            updateQuestion(index, { title });
        }
        router.push(`/create/3-storyboard-and-filming-schedule/title?question=${index}`);
    };

    const handleDeleteTitle = (questionIndex: number) => (planIndex: number) => async (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const title = questions[questionIndex].title || { id: null };
        if (title.id !== null) await deleteTitle(title.id);
        questions[questionIndex].title = null;
        updateQuestion(questionIndex, questions[questionIndex]);
    };

    const handleClose = (confirmDelete: boolean) => () => {
        if (confirmDelete && deleteIndexes !== null) {
            const plans = questions[deleteIndexes.questionIndex].plans || [];
            plans.splice(deleteIndexes.planIndex, 1);
            updateQuestion(deleteIndexes.questionIndex, { plans });
        }
        setDeleteIndexes(null);
    };

    return (
        <div>
            <ThemeLink />
            <Steps activeStep={2} />
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>3</Inverted>{' '}
                    <Trans i18nKey="part3_title">
                        Création du <Inverted>Storyboard</Inverted> et du <Inverted>plan de tournage</Inverted>
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part3_desc')}
                </Typography>

                {questions.map((q, index) => (
                    <Scene
                        q={q}
                        index={index}
                        addPlan={handleAddPlan(index)}
                        removePlan={handleDeletePlan(index)}
                        addTitle={handleAddTitle(index)}
                        removeTitle={handleDeleteTitle(index)}
                        key={index}
                    />
                ))}

                <Modal
                    open={project.questions !== null && deleteIndexes !== null}
                    onClose={handleClose(false)}
                    onConfirm={handleClose(true)}
                    confirmLabel={t('delete')}
                    cancelLabel={t('cancel')}
                    title={t('part3_delete_plan_question')}
                    error={true}
                    ariaLabelledBy="delete-dialog-title"
                    ariaDescribedBy="delete-dialog-description"
                    fullWidth
                >
                    <DialogContentText id="delete-dialog-description">
                        {t('part3_delete_plan_desc', {
                            planNumber: deleteIndexes?.showNumber || 0,
                        })}
                    </DialogContentText>
                </Modal>

                <Box sx={{ display: { xs: 'none', md: 'block' } }} style={{ width: '100%', textAlign: 'right', marginTop: '2rem' }}>
                    <Button
                        component="a"
                        href={`/create/4-pre-mounting`}
                        color="secondary"
                        onClick={handleNext}
                        variant="contained"
                        style={{ width: '200px' }}
                    >
                        {t('next')}
                    </Button>
                </Box>
                <Button
                    sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                    component="a"
                    href={`/create/4-pre-mounting`}
                    color="secondary"
                    onClick={handleNext}
                    variant="contained"
                    style={{ width: '100%', marginTop: '2rem' }}
                >
                    {t('next')}
                </Button>
            </div>
        </div>
    );
};

export default PlanAll;
