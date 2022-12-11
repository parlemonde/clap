import { useSnackbar } from 'notistack';
import React from 'react';

import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';

import { useCreateQuestionTemplate } from 'src/api/question-templates/question-templates.post';
import Modal from 'src/components/ui/Modal';

interface CreateQuestionModalProps {
    scenarioId: number;
    languageCode: string;
    open?: boolean;
    onClose?(): void;
    order?: number;
}

export const CreateQuestionModal = ({ scenarioId, languageCode, open = false, onClose = () => {}, order = 0 }: CreateQuestionModalProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const [question, setQuestion] = React.useState<string>('');
    const [hasError, setHasError] = React.useState<boolean>(false);

    const onQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(event.target.value.slice(0, 280));
        setHasError(false);
    };

    const createQuestionTemplate = useCreateQuestionTemplate();
    const onSubmit = async () => {
        if (scenarioId === -1) {
            setQuestion('');
            onClose();
            return;
        }
        if (question.length === 0) {
            setHasError(true);
            return;
        }

        try {
            await createQuestionTemplate.mutateAsync({
                question,
                scenarioId,
                languageCode,
                index: order,
            });
            enqueueSnackbar('Question ajoutée avec succès!', {
                variant: 'success',
            });
            setQuestion('');
            onClose();
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
        }
    };

    if (scenarioId === -1) {
        return null;
    }
    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            isLoading={createQuestionTemplate.isLoading}
            onConfirm={onSubmit}
            confirmLabel="Créer"
            cancelLabel="Annuler"
            title="Ajouter une question"
            ariaLabelledBy="create-dialog-title"
            ariaDescribedBy="create-dialog-description"
            isFullWidth
        >
            <div id="create-dialog-description">
                <TextField
                    value={question}
                    onChange={onQuestionChange}
                    error={hasError}
                    className={hasError ? 'shake' : ''}
                    label="Question"
                    variant="outlined"
                    fullWidth
                    color="secondary"
                />
                <FormHelperText id="component-helper-text" style={{ marginLeft: '0.2rem', marginTop: '0.2rem' }}>
                    {question.length}/280
                </FormHelperText>
            </div>
        </Modal>
    );
};
