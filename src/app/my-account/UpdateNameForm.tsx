'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { updateUser } from 'src/actions/users/update-user';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { useTranslation } from 'src/contexts/translationContext';
import type { User } from 'src/database/schemas/users';

interface UpdateNameFormProps {
    user: User;
}

export const UpdateNameForm = ({ user }: UpdateNameFormProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [name, setName] = React.useState(user.name);

    const isValidName = name.length > 0;

    const onSubmit = async () => {
        if (!isValidName) {
            return;
        }

        setIsLoading(true);
        await updateUser({
            name,
        });
        setIsLoading(false);
        setIsUpdateModalOpen(false);
        router.refresh();
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
                {t('account_change_button')}
            </a>
            <Modal
                isOpen={isUpdateModalOpen}
                isLoading={isLoading}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setName(user.name);
                }}
                onConfirm={onSubmit}
                confirmLabel={t('edit')}
                cancelLabel={t('cancel')}
                title={t('account_change_name')}
                onOpenAutoFocus={false}
                isFullWidth
            >
                <div id="pseudo-dialog-description">
                    <Field
                        name="pseudo"
                        label={t('signup_name')}
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
                                hasError={!isValidName}
                            />
                        }
                        helperText={isValidName ? '' : t('signup_required')}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    ></Field>
                </div>
            </Modal>
        </>
    );
};
