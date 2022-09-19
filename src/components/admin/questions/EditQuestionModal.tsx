import { useSnackbar } from 'notistack';
import React from 'react';

import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';

import { Modal } from 'src/components/Modal';
import { UserServiceContext } from 'src/services/UserService';
import type { Question } from 'types/models/question.type';

interface EditQuestionModalProps {
    question?: Question | null;
    onClose?(): void;
    setQuestions?(f: (questions: Question[]) => Question[]): void;
}

export const EditQuestionModal: React.FunctionComponent<EditQuestionModalProps> = ({
    question = null,
    onClose = () => {},
    setQuestions = () => {},
}: EditQuestionModalProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const [q, setQ] = React.useState<string>('');
    const [hasError, setHasError] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (question !== null) {
            setHasError(false);
            setQ(question.question);
        }
    }, [question]);
    const onQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQ(event.target.value.slice(0, 280));
        setHasError(false);
    };
    const onSubmit = async () => {
        if (question === null) {
            return;
        }
        if (q.length === 0) {
            setHasError(true);
            return;
        }
        const response = await axiosLoggedRequest({
            method: 'PUT',
            url: `/questions/${question.id}`,
            data: {
                question: q,
            },
        });
        setQ('');
        if (response.error) {
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
            onClose();
            return;
        }
        setQuestions((questions) => {
            const index = questions.findIndex((item) => item.id === question.id);
            if (index !== -1) {
                questions[index].question = q;
            }
            return [...questions];
        });
        enqueueSnackbar('Question modifiée avec succès!', {
            variant: 'success',
        });
        onClose();
    };

    return (
        <Modal
            open={question !== null}
            onClose={onClose}
            onConfirm={onSubmit}
            confirmLabel="Modifier"
            cancelLabel="Annuler"
            title="Modifer une question"
            ariaLabelledBy="create-dialog-title"
            ariaDescribedBy="create-dialog-description"
            fullWidth
        >
            <div id="create-dialog-description">
                <TextField
                    value={q}
                    onChange={onQuestionChange}
                    error={hasError}
                    className={hasError ? 'shake' : ''}
                    label="Question"
                    variant="outlined"
                    fullWidth
                    color="secondary"
                />
                <FormHelperText id="component-helper-text" style={{ marginLeft: '0.2rem', marginTop: '0.2rem' }}>
                    {q.length}/280
                </FormHelperText>
            </div>
        </Modal>
    );
};
