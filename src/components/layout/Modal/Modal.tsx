import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import React from 'react';

import styles from './modal.module.scss';
import { Button } from '../Button';
import { IconButton } from '../Button/IconButton';
import { CircularProgress } from '../CircularProgress';
import { useTranslation } from 'src/contexts/translationContext';

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
    cancelLevel?: 'primary' | 'secondary' | 'error';
    confirmLabel?: string;
    confirmLevel?: 'primary' | 'secondary' | 'error';
    isConfirmDisabled?: boolean;
    width?: 'sm' | 'xs' | 'md' | 'lg' | 'xl';
    isFullWidth?: boolean;
    isLoading?: boolean;
    onOpenAutoFocus?: boolean;
};
export const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    hasCloseButton = true,
    hasCancelButton = true,
    cancelLabel,
    cancelLevel = 'secondary',
    confirmLabel,
    confirmLevel = 'secondary',
    isConfirmDisabled = false,
    width = 'md',
    isFullWidth,
    isLoading,
    onOpenAutoFocus = true,
    children,
}: React.PropsWithChildren<ModalProps>) => {
    const { t } = useTranslation();
    const defaultCancelLabel = t('common.actions.cancel');
    const defaultConfirmLabel = t('common.actions.validate');

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content
                    className={classNames(styles.modalContent, {
                        [styles[`modalContent--${width}`]]: width,
                        [styles['modalContent--is-full-width']]: isFullWidth,
                    })}
                    onOpenAutoFocus={
                        onOpenAutoFocus
                            ? undefined
                            : (event) => {
                                  event.preventDefault();
                              }
                    }
                >
                    <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                    <div className={styles.content}>{children}</div>
                    <div className={styles.footer}>
                        {hasCancelButton && (
                            <Button label={cancelLabel || defaultCancelLabel} onClick={onClose} color={cancelLevel} variant="outlined"></Button>
                        )}
                        {onConfirm && (
                            <Button
                                label={confirmLabel || defaultConfirmLabel}
                                onClick={onConfirm}
                                color={confirmLevel}
                                variant="contained"
                                disabled={isConfirmDisabled}
                                marginLeft="sm"
                            ></Button>
                        )}
                    </div>
                    {hasCloseButton && (
                        <Dialog.Close asChild>
                            <IconButton icon={Cross2Icon} className={styles.closeButton} variant="borderless" />
                        </Dialog.Close>
                    )}
                    {isLoading && (
                        <div className={styles.loader}>
                            <CircularProgress color="primary" />
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
