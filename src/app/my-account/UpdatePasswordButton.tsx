'use client';

import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React from 'react';

import { updateUser } from 'src/actions/users/update-user';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Divider } from 'src/components/layout/Divider';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { useTranslation } from 'src/contexts/translationContext';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

export const UpdatePasswordButton = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [oldPassword, setOldPassword] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');

    const [showPassword, setShowPassword] = React.useState(false);

    const isValidPassword = password !== '' && PASSWORD_REGEX.test(password);
    const [hasConfirmError, setHasConfirmError] = React.useState(false);

    const onSubmit = async () => {
        if (oldPassword.length === 0 || !isValidPassword || password !== passwordConfirm) {
            return;
        }

        setIsLoading(true);
        await updateUser({
            oldPassword,
            password,
        });
        setIsLoading(false);
        setIsUpdateModalOpen(false);
        setOldPassword('');
        setPassword('');
        setPasswordConfirm('');
        router.refresh();
    };

    return (
        <>
            <Button
                label={t('account_password_change')}
                style={{ marginTop: '0.8rem' }}
                className="mobile-full-width"
                onClick={() => {
                    setIsUpdateModalOpen(true);
                }}
                variant="contained"
                color="secondary"
                size="sm"
                marginTop="md"
            ></Button>
            <Modal
                isOpen={isUpdateModalOpen}
                isLoading={isLoading}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setOldPassword('');
                    setPassword('');
                    setPasswordConfirm('');
                }}
                onConfirm={onSubmit}
                confirmLabel={t('edit')}
                cancelLabel={t('cancel')}
                title={t('account_change_password')}
                onOpenAutoFocus={false}
                isFullWidth
            >
                <div id="mdp-dialog-description">
                    <Field
                        name="old_password"
                        label={t('account_current_password')}
                        input={
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                color="secondary"
                                id="old_password"
                                name="old_password"
                                value={oldPassword}
                                onChange={(event) => {
                                    setOldPassword(event.target.value);
                                }}
                                iconAdornment={
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                        variant="borderless"
                                        icon={showPassword ? EyeNoneIcon : EyeOpenIcon}
                                        iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                                    ></IconButton>
                                }
                                iconAdornmentProps={{ position: 'right' }}
                                isFullWidth
                            />
                        }
                    />
                    <Divider marginY="lg" />
                    <Field
                        name="new_password"
                        label={t('account_new_password')}
                        input={
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                color="secondary"
                                id="new_password"
                                name="new_password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                }}
                                iconAdornment={
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                        variant="borderless"
                                        icon={showPassword ? EyeNoneIcon : EyeOpenIcon}
                                        iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                                    ></IconButton>
                                }
                                iconAdornmentProps={{ position: 'right' }}
                                isFullWidth
                                hasError={!isValidPassword}
                            />
                        }
                        helperText={!isValidPassword ? t('signup_password_error') : ''}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    />
                    <Field
                        name="new_password_confirm"
                        label={t('signup_password_confirm')}
                        input={
                            <Input
                                style={{ marginTop: '1rem' }}
                                type={showPassword ? 'text' : 'password'}
                                color="secondary"
                                id="new_password_confirm"
                                name="new_password_confirm"
                                value={passwordConfirm}
                                onChange={(event) => {
                                    setPasswordConfirm(event.target.value);
                                    setHasConfirmError(false);
                                }}
                                onBlur={(event) => {
                                    setHasConfirmError(event.target.value !== password);
                                }}
                                iconAdornment={
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => {
                                            setShowPassword(!showPassword);
                                        }}
                                        variant="borderless"
                                        icon={showPassword ? EyeNoneIcon : EyeOpenIcon}
                                        iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                                    ></IconButton>
                                }
                                iconAdornmentProps={{ position: 'right' }}
                                isFullWidth
                                hasError={hasConfirmError}
                            />
                        }
                        helperText={hasConfirmError ? t('signup_password_confirm_error') : ''}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    />
                </div>
            </Modal>
        </>
    );
};
