'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Flex } from '@frontend/components/layout/Flex';
import { Input } from '@frontend/components/layout/Form';
import { Modal } from '@frontend/components/layout/Modal';
import { deleteUser } from '@server-actions/users/delete-user';

export const DeleteAccountButton = () => {
    const tx = useExtracted('my-account.DeleteAccountButton');
    const commonT = useExtracted('common');
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [confirmText, setConfirmText] = React.useState('');

    const isConfirmTextValid = confirmText.toLowerCase() === tx('supprimer').toLowerCase();

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
                label={tx('Supprimer mon compte')}
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
                confirmLabel={commonT('Supprimer')}
                confirmLevel="error"
                cancelLabel={commonT('Annuler')}
                title={tx('Supprimer mon compte')}
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
                            {tx.rich('Attention! Êtes-vous sur de vouloir supprimer votre compte ? Cette action est <strong>irréversible</strong>.', {
                                strong: (chunks) => <strong>{chunks}</strong>,
                            })}
                            <br />
                            {tx.rich(
                                "Pour supprimer votre compte, veuillez taper '<strong>supprimer</strong>' ci-dessous et cliquez sur supprimer.",
                                {
                                    strong: (chunks) => <strong>{chunks}</strong>,
                                },
                            )}
                        </span>
                    </Flex>
                    <Input
                        isFullWidth
                        value={confirmText}
                        placeholder={tx('Tapez {deleteConfirm} ici', {
                            deleteConfirm: tx('supprimer'),
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
