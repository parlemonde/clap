'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Flex } from '@frontend/components/layout/Flex';
import { Input } from '@frontend/components/layout/Form';
import { Modal } from '@frontend/components/layout/Modal';
import { deleteUser } from '@server-actions/users/delete-user';

export const DeleteAccountButton = () => {
    const t = useTranslations();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [confirmText, setConfirmText] = React.useState('');

    const isConfirmTextValid = confirmText.toLowerCase() === t('my_account_page.delete_account_modal.delete_confirm').toLowerCase();

    const onSubmit = async () => {
        if (!isConfirmTextValid) {
            return;
        }

        setIsLoading(true);
        await deleteUser();
        setIsLoading(false);
        setConfirmText('');
    };

    return (
        <>
            <Button
                label={t('my_account_page.delete_account_button.label')}
                style={{ marginTop: '0.8rem' }}
                className="mobile-full-width"
                variant="contained"
                color="error"
                size="sm"
                marginTop="sm"
                onClick={() => {
                    setIsUpdateModalOpen(true);
                }}
            ></Button>
            <Modal
                isOpen={isUpdateModalOpen}
                isLoading={isLoading}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setConfirmText('');
                }}
                onConfirm={onSubmit}
                confirmLabel={t('common.actions.delete')}
                confirmLevel="error"
                cancelLabel={t('common.actions.cancel')}
                title={t('my_account_page.delete_account_modal.title')}
                isConfirmDisabled={!isConfirmTextValid}
                isFullWidth
            >
                <div id="mdp-dialog-description">
                    <Flex
                        isFullWidth
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        marginBottom="md"
                        paddingX="md"
                        paddingY="sm"
                        style={{
                            backgroundColor: 'rgb(253, 237, 237)',
                            borderRadius: 4,
                            boxSizing: 'border-box',
                            fontSize: '14px',
                            color: 'rgb(95, 33, 32)',
                        }}
                    >
                        <InfoCircledIcon style={{ width: 20, height: 20, marginRight: 8, paddingTop: 1 }} />
                        <span>
                            {t.rich('my_account_page.delete_account_modal.warning1', {
                                strong: (chunks) => <strong>{chunks}</strong>,
                            })}
                            <br />
                            {t.rich('my_account_page.delete_account_modal.warning2', {
                                deleteConfirm: t('my_account_page.delete_account_modal.delete_confirm'),
                                strong: (chunks) => <strong>{chunks}</strong>,
                            })}
                        </span>
                    </Flex>
                    <Input
                        isFullWidth
                        value={confirmText}
                        placeholder={t('my_account_page.delete_account_modal.placeholder', {
                            deleteConfirm: t('my_account_page.delete_account_modal.delete_confirm'),
                        })}
                        color="secondary"
                        onChange={(event) => {
                            setConfirmText(event.target.value);
                        }}
                        style={{ marginTop: '0.25rem' }}
                    />
                </div>
            </Modal>
        </>
    );
};
