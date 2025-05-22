import React from 'react';

import { Modal } from 'src/components/layout/Modal';
import { useTranslation } from 'src/contexts/translationContext';

interface SizeModalProps {
    isOpen: boolean;
    setIsOpen(isOpen: boolean): void;
    setSize(size: number): void;
}

export const SizeModal: React.FunctionComponent<SizeModalProps> = ({ isOpen = false, setIsOpen = () => {}, setSize = () => {} }: SizeModalProps) => {
    const { t } = useTranslation();
    const handleCloseModalSize = (size?: number) => () => {
        setIsOpen(false);
        if (size !== undefined) {
            setSize(size);
        }
    };

    return (
        <Modal width="sm" isOpen={isOpen} onClose={handleCloseModalSize()} title={t('canvas.size_modal.title')} hasCancelButton={false}>
            <div className="canvas-colors-container" id="size-dialog-description">
                <button
                    type="button"
                    style={{ backgroundColor: 'white', border: '1px solid #444', cursor: 'pointer' }}
                    onClick={handleCloseModalSize(0)}
                >
                    <svg focusable="false" viewBox="0 0 24 24" style={{ height: '20px', width: '20px' }}>
                        <circle cx="12" cy="12" r="8"></circle>
                    </svg>
                </button>
                <button
                    type="button"
                    style={{ backgroundColor: 'white', border: '1px solid #444', cursor: 'pointer' }}
                    onClick={handleCloseModalSize(1)}
                >
                    <svg focusable="false" viewBox="0 0 24 24" style={{ height: '28px', width: '28px' }}>
                        <circle cx="12" cy="12" r="8"></circle>
                    </svg>
                </button>
                <button
                    type="button"
                    style={{ backgroundColor: 'white', border: '1px solid #444', cursor: 'pointer' }}
                    onClick={handleCloseModalSize(2)}
                >
                    <svg focusable="false" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8"></circle>
                    </svg>
                </button>
            </div>
        </Modal>
    );
};
