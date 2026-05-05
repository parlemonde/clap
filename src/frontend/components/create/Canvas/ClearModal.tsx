import { useTranslations } from 'next-intl';
import React from 'react';

import { Modal } from '@frontend/components/layout/Modal';

interface ClearModalProps {
    isOpen?: boolean;
    onClear?(clear: boolean): () => void;
}

export const ClearModal: React.FunctionComponent<ClearModalProps> = ({ isOpen = false, onClear = () => () => {} }: ClearModalProps) => {
    const t = useTranslations();
    return (
        <Modal
            width="sm"
            isOpen={isOpen}
            onClose={onClear(false)}
            onConfirm={onClear(true)}
            confirmLevel="error"
            title={t('canvas.clear_modal.title')}
        >
            {t('canvas.clear_modal.desc')}
        </Modal>
    );
};
