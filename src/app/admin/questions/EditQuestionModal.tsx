'use client';

import React from 'react';

import { editQuestion } from 'src/actions/questions/edit-question';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import type { Question } from 'src/database/schemas/questions';

interface EditQuestionModalProps {
    question?: Question | null;
    onClose?(): void;
}
export const EditQuestionModal = ({ question = null, onClose = () => {} }: EditQuestionModalProps) => {
    const [q, setQ] = React.useState<string>(question?.question || '');
    const [hasError, setHasError] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

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
        if (!question) {
            return;
        }

        setIsLoading(true);
        await editQuestion({ question: q, id: question.id });
        setQ('');
        onClose();
        setIsLoading(false);
    };

    return (
        <Modal
            isOpen={question !== null}
            onClose={onClose}
            isLoading={isLoading}
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
