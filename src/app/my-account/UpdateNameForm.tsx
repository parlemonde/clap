'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { Field, Input } from '@frontend/components/layout/Form';
import { Modal } from '@frontend/components/layout/Modal';
import { useTranslation } from '@frontend/contexts/translationContext';

import type { User } from '@server/database/schemas/users';

import { updateUser } from '@server-actions/users/update-user';

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
                {t('my_account_page.change_name_button.label')}
            </a>
            <Modal
                isOpen={isUpdateModalOpen}
                isLoading={isLoading}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setName(user.name);
                }}
                onConfirm={onSubmit}
                confirmLabel={t('common.actions.edit')}
                cancelLabel={t('common.actions.cancel')}
                title={t('my_account_page.change_name_modal.title')}
                onOpenAutoFocus={false}
                isFullWidth
            >
                <div id="pseudo-dialog-description">
                    <Field
                        name="pseudo"
                        label={t('my_account_page.name_field.label')}
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
                        helperText={isValidName ? '' : t('my_account_page.name_field.error')}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    ></Field>
                </div>
            </Modal>
        </>
    );
};
