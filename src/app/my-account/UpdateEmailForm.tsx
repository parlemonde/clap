'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React from 'react';

import { updateUser } from 'src/actions/users/update-user';
import { Flex } from 'src/components/layout/Flex';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { useTranslation } from 'src/contexts/translationContext';
import type { User } from 'src/database/schemas/users';

const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;

interface UpdateEmailFormProps {
    user: User;
}

export const UpdateEmailForm = ({ user }: UpdateEmailFormProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [email, setEmail] = React.useState(user.email);

    const isValidEmail = EMAIL_REGEX.test(email);

    const onSubmit = async () => {
        if (!isValidEmail) {
            return;
        }

        setIsLoading(true);
        await updateUser({
            email,
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
                {t('my_account_page.change_email_button.label')}
            </a>
            <Modal
                isOpen={isUpdateModalOpen}
                isLoading={isLoading}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setEmail(user.email);
                }}
                onConfirm={onSubmit}
                confirmLabel={t('common.actions.edit')}
                cancelLabel={t('common.actions.cancel')}
                title={t('my_account_page.change_email_modal.title')}
                onOpenAutoFocus={false}
                isFullWidth
            >
                <div id="pseudo-dialog-description">
                    <Flex
                        isFullWidth
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        marginBottom="md"
                        paddingX="md"
                        paddingY="sm"
                        style={{
                            backgroundColor: 'rgb(229, 246, 253)',
                            borderRadius: 4,
                            boxSizing: 'border-box',
                            fontSize: '14px',
                            color: 'rgb(1, 67, 97)',
                        }}
                    >
                        <InfoCircledIcon style={{ width: 20, height: 20, marginRight: 8, paddingTop: 1 }} />
                        {t('my_account_page.change_email_modal.info')}
                    </Flex>
                    <Field
                        name="email"
                        label={t('my_account_page.email_field.label')}
                        input={
                            <Input
                                name="email"
                                id="email"
                                isFullWidth
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                }}
                                required
                                color="secondary"
                                hasError={!isValidEmail}
                            />
                        }
                        helperText={!isValidEmail ? t('my_account_page.email_field.error') : ''}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    ></Field>
                </div>
            </Modal>
        </>
    );
};
