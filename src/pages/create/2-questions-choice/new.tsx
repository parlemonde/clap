import { useRouter } from 'next/router';
import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Inverted } from 'src/components/Inverted';
import { Trans } from 'src/components/Trans';
import { Steps } from 'src/components/create/Steps';
import { ThemeLink } from 'src/components/create/ThemeLink';
import { useTranslation } from 'src/i18n/useTranslation';
import { ProjectServiceContext } from 'src/services/useProject';
import { useQuestionRequests } from 'src/services/useQuestions';
import type { Question } from 'types/models/question.type';

const QuestionNew: React.FunctionComponent = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { addQuestion } = useQuestionRequests();
    const { project, updateProject } = React.useContext(ProjectServiceContext);
    const [hasError, setHasError] = React.useState<boolean>(false);
    const [newQuestion, setNewQuestion] = React.useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setNewQuestion(event.target.value.slice(0, 280));
    };

    const handleBack = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/2-questions-choice`);
    };

    const handleSubmit = async (event: React.MouseEvent) => {
        event.preventDefault();
        if (newQuestion.length === 0) {
            setHasError(true);
            setTimeout(() => {
                setHasError(false);
            }, 1000);
            return;
        }

        const questions = project.questions !== null ? [...project.questions] : [];
        let newQ: Question | null = {
            id: 0,
            isDefault: false,
            question: newQuestion,
            scenarioId: project.scenario?.id ?? 0,
            languageCode: project.scenario?.languageCode || 'fr',
            index: questions.length,
            voiceOff: null,
            voiceOffBeginTime: 0,
            sound: null,
            duration: 0,
        };
        if (project !== null && project.id !== null && project.id !== -1) {
            newQ = await addQuestion({ ...newQ, projectId: project.id });
            if (newQ === null) {
                return;
            }
        } else {
            newQ.id = Math.max(0, ...questions.map((q) => q.id)) + 1;
        }
        newQ.plans = [
            {
                id: 0,
                index: 0,
                description: '',
                image: null,
                url: null,
                duration: 3000,
            },
        ];
        questions.push(newQ);
        updateProject({
            questions,
        });
        router.push(`/create/2-questions-choice`);
    };

    return (
        <div>
            <ThemeLink />
            <Steps activeStep={1} />
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>2</Inverted>{' '}
                    <Trans i18nKey="part2_title">
                        Mes <Inverted>questions</Inverted>
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    {t('part2_add_question')}
                </Typography>
                <Typography color="inherit" variant="h2" style={{ marginTop: '1rem' }}>
                    <div>
                        <TextField
                            value={newQuestion}
                            onChange={handleChange}
                            required
                            error={hasError}
                            className={hasError ? 'shake' : ''}
                            id="scenarioDescription"
                            multiline
                            placeholder={t('part2_add_question_placeholder')}
                            fullWidth
                            style={{ marginTop: '0.5rem' }}
                            variant="outlined"
                            color="secondary"
                            autoComplete="off"
                        />
                        <FormHelperText id="component-helper-text" style={{ marginLeft: '0.2rem', marginTop: '0.2rem' }}>
                            {newQuestion.length}/280
                        </FormHelperText>
                    </div>
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'block' } }} style={{ width: '100%', textAlign: 'right' }}>
                    <Button
                        component="a"
                        variant="outlined"
                        color="secondary"
                        style={{ marginRight: '1rem' }}
                        href={`/create/2-questions-choice`}
                        onClick={handleBack}
                    >
                        {t('cancel')}
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleSubmit}>
                        {t('add')}
                    </Button>
                </Box>
                <Button
                    sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                    variant="contained"
                    color="secondary"
                    onClick={handleSubmit}
                    style={{ width: '100%', marginTop: '2rem' }}
                >
                    {t('add')}
                </Button>
            </div>
        </div>
    );
};

export default QuestionNew;
