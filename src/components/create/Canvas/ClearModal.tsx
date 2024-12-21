import React from 'react';

import { Modal } from 'src/components/layout/Modal';
import { useTranslation } from 'src/contexts/translationContext';

interface ClearModalProps {
    isOpen?: boolean;
    onClear?(clear: boolean): () => void;
}

export const ClearModal: React.FunctionComponent<ClearModalProps> = ({ isOpen = false, onClear = () => () => {} }: ClearModalProps) => {
    const { t } = useTranslation();
    return (
        <Modal width="sm" isOpen={isOpen} onClose={onClear(false)} onConfirm={onClear(true)} confirmLevel="error" title={t('tool_clear_title')}>
            {t('tool_clear_desc')}
        </Modal>
    );
};
