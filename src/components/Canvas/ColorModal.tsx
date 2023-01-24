import React from 'react';

import ButtonBase from '@mui/material/ButtonBase';

import Modal from 'src/components/ui/Modal';
import { useTranslation } from 'src/i18n/useTranslation';

const colors = ['#444', '#eda000', '#79c3a5', '#6065fc', '#c36561'];

interface ColorModalProps {
    isOpen: boolean;
    setIsOpen(isOpen: boolean): void;
    setColor(color: string): void;
}

export const ColorModal: React.FunctionComponent<ColorModalProps> = ({
    isOpen = false,
    setIsOpen = () => {},
    setColor = () => {},
}: ColorModalProps) => {
    const { t } = useTranslation();
    const handleCloseModalColor = (color?: string) => () => {
        setIsOpen(false);
        if (color !== undefined) {
            setColor(color);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            ariaDescribedBy="color-dialog-title"
            ariaLabelledBy="color-dialog-description"
            onClose={handleCloseModalColor()}
            title={t('tool_color_title')}
            hasCancelButton={false}
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
