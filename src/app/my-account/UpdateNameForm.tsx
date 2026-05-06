'use client';

import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import React from 'react';

import { Field, Input } from '@frontend/components/layout/Form';
import { Modal } from '@frontend/components/layout/Modal';
import { authClient } from '@frontend/lib/auth-client';
import type { User } from '@server/database/schemas/users';

interface UpdateNameFormProps {
    user: User;
}

export const UpdateNameForm = ({ user }: UpdateNameFormProps) => {
    const tx = useExtracted('my-account.UpdateNameForm');
    const commonT = useExtracted('common');
    const router = useRouter();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [updateErrorMessage, setUpdateErrorMessage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const [name, setName] = React.useState(user.name);

    const isValidName = name.length > 0;

    const onSubmit = async () => {
        if (!isValidName) {
            return;
        }

        setIsLoading(true);
        const { data, error } = await authClient.updateUser({
            name,
        });
        setIsLoading(false);
        if (error || !data.status) {
            setUpdateErrorMessage('Echec de la mise à jour du nom');
        } else {
            setIsUpdateModalOpen(false);
            router.refresh();
        }
    };

    return (
        <>
            <a
                tabIndex={0}
                className="color-primary"
                onKeyDown={(event) => {
                    if (event.key === ' ' || event.key === 'Enter') {
                        setIsUpdateModalOpen(true);
                    }
                }}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => {
                    setIsUpdateModalOpen(true);
                }}
            >
                {tx('Changer mon nom')}
            </a>
            <Modal
                isOpen={isUpdateModalOpen}
                isLoading={isLoading}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setName(user.name);
                }}
                onConfirm={onSubmit}
                confirmLabel={commonT('Modifier')}
                cancelLabel={commonT('Annuler')}
                title={tx('Changer mon nom')}
                onOpenAutoFocus={false}
                isFullWidth
            >
                <div id="pseudo-dialog-description">
                    <Field
                        name="pseudo"
                        label={tx('Nom du professeur')}
                        input={
                            <Input
                                id="name"
                                name="name"
                                isFullWidth
                                required
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                }}
                                color="secondary"
                                hasError={!!updateErrorMessage || !isValidName}
                            />
                        }
                        helperText={updateErrorMessage || (isValidName ? '' : tx('Nom invalide'))}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    ></Field>
                </div>
            </Modal>
        </>
    );
};
