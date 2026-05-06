import { useExtracted } from 'next-intl';
import React from 'react';

import { Modal } from '@frontend/components/layout/Modal';

interface ClearModalProps {
    isOpen?: boolean;
    onClear?(clear: boolean): () => void;
}

export const ClearModal: React.FunctionComponent<ClearModalProps> = ({ isOpen = false, onClear = () => () => {} }: ClearModalProps) => {
    const tx = useExtracted('ClearModal');
    return (
        <Modal width="sm" isOpen={isOpen} onClose={onClear(false)} onConfirm={onClear(true)} confirmLevel="error" title={tx('Effacer le canvas')}>
            {tx('Êtes-vous sûr de vouloir effacer totalement le canvas ?')}
        </Modal>
    );
};
