import { useSnackbar } from 'notistack';
import React from 'react';

import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';

import { useUpdateQuestionTemplate } from 'src/api/question-templates/question-templates.put';
import Modal from 'src/components/ui/Modal';
import type { QuestionTemplate } from 'types/models/question.type';

interface EditQuestionModalProps {
    question?: QuestionTemplate | null;
    onClose?(): void;
}

export const EditQuestionModal: React.FunctionComponent<EditQuestionModalProps> = ({
    question = null,
    onClose = () => {},
}: EditQuestionModalProps) => {
    const { enqueueSnackbar } = useSnackbar();
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

    const updateQuestionTemplate = useUpdateQuestionTemplate();
    const onSubmit = async () => {
        if (question === null) {
            return;
        }
        if (q.length === 0) {
            setHasError(true);
            return;
        }
        try {
            await updateQuestionTemplate.mutateAsync({
                questionId: question.id,
                question: q,
            });
            enqueueSnackbar('Question modifiée avec succès!', {
                variant: 'success',
            });
            onClose();
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
        }
    };

    return (
        <Modal
            isOpen={question !== null}
            onClose={onClose}
            isLoading={updateQuestionTemplate.isLoading}
            onConfirm={onSubmit}
            confirmLabel="Modifier"
            cancelLabel="Annuler"
            title="Modifer une question"
            ariaLabelledBy="create-dialog-title"
            ariaDescribedBy="create-dialog-description"
            isFullWidth
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
