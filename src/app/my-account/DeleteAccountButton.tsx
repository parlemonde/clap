'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import React from 'react';

import { deleteUser } from 'src/actions/users/delete-user';
import { Button } from 'src/components/layout/Button';
import { Flex } from 'src/components/layout/Flex';
import { Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';

export const DeleteAccountButton = () => {
    const { t } = useTranslation();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [confirmText, setConfirmText] = React.useState('');

    const isConfirmTextValid = confirmText.toLowerCase() === t('account_delete_confirm').toLowerCase();

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
                label={t('account_delete_button')}
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
                confirmLabel={t('delete')}
                confirmLevel="error"
                cancelLabel={t('cancel')}
                title={t('account_delete_button')}
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
                            <Trans i18nKey="account_delete_warning1">
                                Attention! Êtes-vous sur de vouloir supprimer votre compte ? Cette action est <strong>irréversible</strong>.
                            </Trans>
                            <br />
                            <Trans i18nKey="account_delete_warning2" i18nParams={{ deleteConfirm: t('account_delete_confirm') }}>
                                Pour supprimer votre compte, veuillez taper <strong>supprimer</strong> ci-dessous et cliquez sur supprimer.
                            </Trans>
                        </span>
                    </Flex>
                    <Input
                        isFullWidth
                        value={confirmText}
                        placeholder={t('account_delete_placeholder', { deleteConfirm: t('account_delete_confirm') })}
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
