import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Typography, Box, IconButton } from '@mui/material';

import { useDeleteQuestionMutation } from 'src/api/questions/questions.delete';
import { useReorderQuestionsMutation } from 'src/api/questions/questions.order';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { SaveProjectModal } from 'src/components/SaveProjectModal';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import Modal from 'src/components/ui/Modal';
import { Sortable } from 'src/components/ui/Sortable';
import { Trans } from 'src/components/ui/Trans';
import { projectContext } from 'src/contexts/projectContext';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';

type QuestionCardProps = {
    question: string;
    index?: number;
    onDelete?(): void;
};

const QuestionCard = ({ question, index = 0, onDelete }: QuestionCardProps) => {
    return (
        <Box sx={{ border: '1px solid', borderColor: (theme) => theme.palette.secondary.main }} className="question-container">
            <Box sx={{ backgroundColor: (theme) => theme.palette.secondary.main }} className="question-index">
                <DragIndicatorIcon style={{ height: '1rem' }} />
                {index + 1}
            </Box>
            <div className="question-content">
                <p>{question}</p>
            </div>
            <div className="question-actions">
                <Link href={`/create/2-questions/edit${serializeToQueryUrl({ question: index })}`} passHref>
                    <IconButton
                        sx={{ border: '1px solid', borderColor: (theme) => theme.palette.secondary.main }}
                        aria-label="edit"
                        size="small"
                        color="secondary"
                        style={{ marginRight: '0.6rem' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Link>
                <IconButton
                    sx={{ border: '1px solid', borderColor: (theme) => theme.palette.secondary.main }}
                    aria-label="delete"
                    size="small"
                    color="secondary"
                    onClick={onDelete}
                >
                    <DeleteIcon />
                </IconButton>
            </div>
        </Box>
    );
};

const QuestionsPage = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const { user } = React.useContext(userContext);
    const { project, questions, isLoading: isProjectLoading, updateProject } = React.useContext(projectContext);
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const [deleteQuestionIndex, setDeleteQuestionIndex] = React.useState(-1);
    const [showSaveProjectModal, setShowSaveProjectModal] = React.useState(false);

    React.useEffect(() => {
        if (!project && !isProjectLoading) {
            router.replace('/create');
        }
    }, [router, project, isProjectLoading]);

    const deleteQuestionMutation = useDeleteQuestionMutation();
    const reorderQuestionsMutation = useReorderQuestionsMutation();

    const onDeleteQuestion = async () => {
        const newQuestions = [...questions];
        const [questionToDelete] = newQuestions.splice(deleteQuestionIndex, 1);
        if (questionToDelete !== undefined && project !== undefined && project.id !== 0) {
            try {
                await deleteQuestionMutation.mutateAsync({ questionId: questionToDelete.id });
            } catch (err) {
                console.error(err);
                enqueueSnackbar(t('unknown_error'), {
                    variant: 'error',
                });
                return;
            }
        }
        updateProject({ questions: newQuestions });
        setDeleteQuestionIndex(-1);
    };

    const onReorderQuestions = (order: number[]) => {
        if (!project || project.id === 0) {
            return;
        }
        reorderQuestionsMutation.mutate(
            {
                order,
            },
            {
                onError(error) {
                    console.error(error);
                    enqueueSnackbar(t('unknown_error'), {
                        variant: 'error',
                    });
                },
            },
        );
    };

    return (
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={1}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>2</Inverted>{' '}
                    <Trans i18nKey="part2_title">
                        Mes <Inverted>séquences</Inverted>
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part2_desc')}
                </Typography>
                <Link href={`/create/2-questions/new`} passHref>
                    <Button
                        component="a"
                        variant="outlined"
                        color="secondary"
                        style={{
                            textTransform: 'none',
                            marginTop: '2rem',
                        }}
                    >
                        {t('add_question')}
                    </Button>
                </Link>
                {!isProjectLoading && (
                    <Sortable
                        list={questions}
                        setList={(newQuestions) => {
                            updateProject({ questions: newQuestions });
                            onReorderQuestions(newQuestions.map((q) => q.id));
                        }}
                    >
                        {questions.map((q, index) => (
                            <QuestionCard
                                key={q.id}
                                question={q.question}
                                index={index}
                                onDelete={() => {
                                    setDeleteQuestionIndex(index);
                                }}
                            />
                        ))}
                    </Sortable>
                )}
                <NextButton
                    onNext={() => {
                        if (project !== undefined && project.id === 0 && user !== null) {
                            setShowSaveProjectModal(true);
                        } else {
                            router.push('/create/3-storyboard');
                        }
                    }}
                />
                <Modal
                    isOpen={deleteQuestionIndex !== -1}
                    onClose={() => {
                        setDeleteQuestionIndex(-1);
                    }}
                    onConfirm={onDeleteQuestion}
                    title="Supprimer la question?"
                    confirmLabel="Supprimer"
                    confirmLevel="error"
                    ariaLabelledBy="delete_question_confirm"
                    ariaDescribedBy="delete_question_confirm_description"
                    isLoading={deleteQuestionMutation.isLoading}
                >
                    Voulez vous vraiment supprimer la question: {questions[deleteQuestionIndex]?.question || ''} ?
                </Modal>
                <SaveProjectModal
                    isOpen={showSaveProjectModal}
                    onClose={() => {
                        setShowSaveProjectModal(false);
                        router.push('/create/3-storyboard');
                    }}
                />
            </div>
        </div>
    );
};

export default QuestionsPage;
