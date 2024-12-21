import * as React from 'react';

import { Form } from 'src/components/layout/Form';
import { NextButton } from 'src/components/navigation/NextButton';
import { useTranslation } from 'src/contexts/translationContext';
import type { Sequence } from 'src/hooks/useLocalStorage/local-storage';

interface MontageFormProps {
    sequence: Sequence;
    setSequence: (sequence: Sequence) => void;
    onSubmit: (sequence: Sequence) => void;
}
export const MontageForm = ({ sequence, onSubmit }: MontageFormProps) => {
    const { t } = useTranslation();

    const onNext = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit(sequence);
    };

    return (
        <Form onSubmit={onNext}>
            montage form
            <NextButton label={t('continue')} backHref="/create/4-pre-mounting" type="submit" />
        </Form>
    );
};
