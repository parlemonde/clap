import React from 'react';

import ButtonBase from '@mui/material/ButtonBase';

import { Modal } from 'src/components/Modal';
import { useTranslation } from 'src/i18n/useTranslation';

const colors = ['#444', '#eda000', '#79c3a5', '#6065fc', '#c36561'];

interface ColorModalProps {
    open: boolean;
    setOpen(isOpen: boolean): void;
    setColor(color: string): void;
}

export const ColorModal: React.FunctionComponent<ColorModalProps> = ({ open = false, setOpen = () => {}, setColor = () => {} }: ColorModalProps) => {
    const { t } = useTranslation();
    const handleCloseModalColor = (color?: string) => () => {
        setOpen(false);
        if (color !== undefined) {
            setColor(color);
        }
    };

    return (
        <Modal
            open={open}
            ariaDescribedBy="color-dialog-title"
            ariaLabelledBy="color-dialog-description"
            onClose={handleCloseModalColor()}
            title={t('tool_color_title')}
        >
            <div className="canvas-colors-container" id="color-dialog-description">
                {colors.map((c) => (
                    <ButtonBase key={c} style={{ backgroundColor: c }} onClick={handleCloseModalColor(c)} />
                ))}
                <ButtonBase onClick={handleCloseModalColor('white')} style={{ backgroundColor: 'white', border: '1px solid #444' }} />
            </div>
        </Modal>
    );
};
