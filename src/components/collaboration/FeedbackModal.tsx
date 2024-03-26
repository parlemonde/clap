import React from 'react';

import { Modal } from '../layout/Modal';
import { useTranslation } from 'src/i18n/useTranslation';

interface FeedbackModalProps {
    feedback: string;
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal: React.FunctionComponent<FeedbackModalProps> = ({ feedback, isOpen, onClose }: FeedbackModalProps) => {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('collaboration_modal_feedback_title')} cancelLabel={t('close')}>
            {feedback}
        </Modal>
    );
};
