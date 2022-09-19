import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { useTranslation } from 'src/i18n/useTranslation';

interface ModalProps {
    open?: boolean;
    onClose?(): void;
    onConfirm?(): void;
    ariaLabelledBy: string;
    ariaDescribedBy: string;
    title?: string;
    children?: React.ReactNode | React.ReactNodeArray;
    cancelLabel?: string;
    confirmLabel?: string;
    fullWidth?: boolean;
    maxWidth?: false | 'sm' | 'xs' | 'md' | 'lg' | 'xl';
    noCloseOutsideModal?: boolean;
    error?: boolean;
    disabled?: boolean;
}

export const Modal: React.FunctionComponent<ModalProps> = ({
    open = true,
    onClose = () => {},
    onConfirm,
    ariaLabelledBy,
    ariaDescribedBy,
    title = '',
    children = <div />,
    cancelLabel = '',
    confirmLabel = '',
    fullWidth = false,
    noCloseOutsideModal = false,
    maxWidth = 'sm',
    error = false,
    disabled = false,
}: ModalProps) => {
    const { t } = useTranslation();
    return (
        <Dialog
            open={open}
            onClose={noCloseOutsideModal ? () => {} : onClose}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            fullWidth={fullWidth}
            maxWidth={maxWidth}
        >
            <DialogTitle id={ariaLabelledBy}>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" variant="outlined">
                    {cancelLabel || t('cancel')}
                </Button>
                {onConfirm !== undefined && error && (
                    <Button
                        sx={{
                            color: (theme) => theme.palette.error.contrastText,
                            background: (theme) => theme.palette.error.light,
                            '&:hover': {
                                backgroundColor: (theme) => theme.palette.error.dark,
                            },
                        }}
                        onClick={onConfirm}
                        disabled={disabled}
                        variant="contained"
                    >
                        {confirmLabel || t('yes')}
                    </Button>
                )}
                {onConfirm !== undefined && !error && (
                    <Button onClick={onConfirm} disabled={disabled} color="secondary" variant="contained">
                        {confirmLabel || t('yes')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
