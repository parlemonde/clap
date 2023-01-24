import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, CircularProgress, Box } from '@mui/material';

type ModalProps = {
    // --
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void | Promise<void>;
    // --
    title: string;
    hasCloseButton?: boolean;
    hasCancelButton?: boolean;
    cancelLabel?: string;
    cancelLevel?: 'inherit' | 'primary' | 'secondary';
    confirmLabel?: string;
    confirmLevel?: 'inherit' | 'primary' | 'secondary' | 'error';
    isConfirmDisabled?: boolean;
    maxWidth?: false | 'sm' | 'xs' | 'md' | 'lg' | 'xl';
    isFullWidth?: boolean;
    isLoading?: boolean;
    // --
    ariaLabelledBy: string;
    ariaDescribedBy: string;
};

const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    hasCloseButton = true,
    hasCancelButton = true,
    cancelLabel = 'Annuler',
    cancelLevel = 'inherit',
    confirmLabel = 'Oui',
    confirmLevel = 'inherit',
    isConfirmDisabled = false,
    maxWidth = 'md',
    isFullWidth,
    isLoading = false,
    ariaDescribedBy,
    ariaLabelledBy,
    children,
}: React.PropsWithChildren<ModalProps>) => {
    return (
        <Dialog
            open={isOpen}
            onClose={hasCloseButton && !isLoading ? onClose : () => {}}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            fullWidth={isFullWidth}
            maxWidth={maxWidth}
        >
            <DialogTitle id={ariaLabelledBy} sx={{ margin: 0, p: 2, paddingRight: '4rem' }}>
                {title}
                {hasCloseButton && !isLoading && (
                    <IconButton
                        aria-label="close"
                        sx={{
                            p: 1.5,
                            position: 'absolute',
                            right: (theme) => theme.spacing(1),
                            top: (theme) => theme.spacing(1),
                            color: 'grey.500',
                        }}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent
                style={{
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                }}
            >
                {children}
            </DialogContent>
            <DialogActions>
                {hasCancelButton && (
                    <Button onClick={onClose} color={cancelLevel} variant="outlined">
                        {cancelLabel}
                    </Button>
                )}
                {onConfirm && (
                    <Button onClick={onConfirm} color={confirmLevel} variant="outlined" disabled={isConfirmDisabled}>
                        {confirmLabel}
                    </Button>
                )}
            </DialogActions>
            {isLoading && (
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: (t) => t.palette.background.default,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CircularProgress color="primary" />
                </Box>
            )}
        </Dialog>
    );
};

export default Modal;
