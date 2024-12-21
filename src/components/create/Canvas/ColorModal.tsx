import React from 'react';

import { Modal } from 'src/components/layout/Modal';
import { useTranslation } from 'src/contexts/translationContext';

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
        <Modal width="sm" isOpen={isOpen} onClose={handleCloseModalColor()} title={t('tool_color_title')} hasCancelButton={false}>
            <div className="canvas-colors-container" id="color-dialog-description">
                {colors.map((c) => (
                    <button
                        key={c}
                        type="button"
                        style={{ backgroundColor: c, border: 'none', cursor: 'pointer' }}
                        onClick={handleCloseModalColor(c)}
                    />
                ))}
                <button
                    type="button"
                    onClick={handleCloseModalColor('white')}
                    style={{ backgroundColor: 'white', border: '1px solid #444', cursor: 'pointer' }}
                />
            </div>
        </Modal>
    );
};
