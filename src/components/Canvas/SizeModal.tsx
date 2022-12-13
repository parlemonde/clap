import React from 'react';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ButtonBase from '@mui/material/ButtonBase';

import Modal from 'src/components/ui/Modal';
import { useTranslation } from 'src/i18n/useTranslation';

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
        <Modal
            isOpen={isOpen}
            ariaDescribedBy="size-dialog-title"
            ariaLabelledBy="size-dialog-description"
            onClose={handleCloseModalSize()}
            title={t('tool_stroke_width_title')}
            hasCancelButton={false}
        >
            <div className="canvas-colors-container" id="size-dialog-description">
                <ButtonBase style={{ backgroundColor: 'white', border: '1px solid #444' }} onClick={handleCloseModalSize(0)}>
                    <FiberManualRecordIcon fontSize="small" />
                </ButtonBase>
                <ButtonBase style={{ backgroundColor: 'white', border: '1px solid #444' }} onClick={handleCloseModalSize(1)}>
                    <FiberManualRecordIcon />
                </ButtonBase>
                <ButtonBase style={{ backgroundColor: 'white', border: '1px solid #444' }} onClick={handleCloseModalSize(2)}>
                    <FiberManualRecordIcon fontSize="large" />
                </ButtonBase>
            </div>
        </Modal>
    );
};