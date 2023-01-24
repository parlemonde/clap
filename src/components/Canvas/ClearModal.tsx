import React from 'react';

import DialogContentText from '@mui/material/DialogContentText';

import Modal from 'src/components/ui/Modal';
import { useTranslation } from 'src/i18n/useTranslation';

interface ClearModalProps {
    isOpen?: boolean;
    onClear?(clear: boolean): () => void;
}

export const ClearModal: React.FunctionComponent<ClearModalProps> = ({ isOpen = false, onClear = () => () => {} }: ClearModalProps) => {
    const { t } = useTranslation();
    return (
        <Modal
            isOpen={isOpen}
            ariaDescribedBy="clear-dialog-title"
            ariaLabelledBy="clear-dialog-description"
            onClose={onClear(false)}
            onConfirm={onClear(true)}
            confirmLevel="error"
            title={t('tool_clear_title')}
        >
            <DialogContentText id="clear-dialog-description">{t('tool_clear_desc')}</DialogContentText>
        </Modal>
    );
};
