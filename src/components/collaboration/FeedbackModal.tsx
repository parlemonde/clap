import React from 'react';

import { Button } from 'src/components/layout/Button';
import { Modal } from 'src/components/layout/Modal';
import type { Sequence } from 'src/lib/project.types';

interface FeedbackModalProps {
    question?: Sequence;
}
export const FeedbackModal = ({ question }: FeedbackModalProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const feedbacks = question?.feedbacks || [];
    const lastFeedback = feedbacks.length > 0 ? feedbacks[feedbacks.length - 1] : undefined;

    if (!lastFeedback) {
        return null;
    }
    return (
        <>
            <Button label="Voir les Retours" variant="contained" color="secondary" onClick={() => setIsOpen(true)} marginLeft="md" size="sm" />
            <Modal title="Retours du professeur" isOpen={isOpen} onClose={() => setIsOpen(false)} cancelLabel="Fermer">
                <div style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 10, margin: '8px 0' }}>{lastFeedback}</div>
            </Modal>
        </>
    );
};
