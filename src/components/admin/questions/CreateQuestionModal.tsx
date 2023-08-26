import React from 'react';

import { useCreateQuestionTemplate } from 'src/api/question-templates/question-templates.post';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';

interface CreateQuestionModalProps {
    scenarioId: number;
    languageCode: string;
    open?: boolean;
    onClose?(): void;
    order?: number;
}

export const CreateQuestionModal = ({ scenarioId, languageCode, open = false, onClose = () => {}, order = 0 }: CreateQuestionModalProps) => {
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
            sendToast({ message: 'Question ajoutée avec succès!', type: 'success' });
            setQuestion('');
            onClose();
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
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
            isFullWidth
        >
            <Field
                name="create-question"
                label="Question"
                input={
                    <Input
                        name="create-question"
                        id="create-question"
                        value={question}
                        onChange={onQuestionChange}
                        hasError={hasError}
                        isFullWidth
                        color="secondary"
                    />
                }
                helperText={`${question.length}/280`}
            ></Field>
        </Modal>
    );
};
