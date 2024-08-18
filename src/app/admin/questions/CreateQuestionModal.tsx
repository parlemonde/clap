'use client';

import React from 'react';

import { createQuestionTemplate } from 'src/actions/questions-templates/create-question-template';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';

interface CreateQuestionModalProps {
    scenarioId: number;
    languageCode: string;
    open?: boolean;
    onClose?(): void;
}
export const CreateQuestionModal = ({ scenarioId, languageCode, open = false, onClose = () => {} }: CreateQuestionModalProps) => {
    const [question, setQuestion] = React.useState<string>('');
    const [hasError, setHasError] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const onQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(event.target.value.slice(0, 280));
        setHasError(false);
    };

    const onSubmit = async () => {
        setIsLoading(true);
        await createQuestionTemplate({ question, scenarioId, languageCode });
        setQuestion('');
        onClose();
        setIsLoading(false);
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            isLoading={isLoading}
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
