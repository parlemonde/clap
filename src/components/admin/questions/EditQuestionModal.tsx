import React from 'react';

import { useUpdateQuestionTemplate } from 'src/api/question-templates/question-templates.put';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';
import type { QuestionTemplate } from 'types/models/question.type';

interface EditQuestionModalProps {
    question?: QuestionTemplate | null;
    onClose?(): void;
}

export const EditQuestionModal: React.FunctionComponent<EditQuestionModalProps> = ({
    question = null,
    onClose = () => {},
}: EditQuestionModalProps) => {
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
            sendToast({ message: 'Question modifiée avec succès!', type: 'success' });
            onClose();
        } catch (err) {
            console.error(err);
            sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
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
            isFullWidth
            onOpenAutoFocus={false}
        >
            <Field
                name="edit-question"
                label="Question"
                input={
                    <Input
                        name="edit-question"
                        id="edit-question"
                        value={q}
                        onChange={onQuestionChange}
                        hasError={hasError}
                        isFullWidth
                        color="secondary"
                    />
                }
                helperText={`${q.length}/280`}
            ></Field>
        </Modal>
    );
};
