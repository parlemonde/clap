'use client';

import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { useTranslation } from '@frontend/contexts/translationContext';
import { authClient } from '@frontend/lib/auth-client';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

interface UpdatePasswordFormProps {
    verifyToken: string;
}
export const UpdatePasswordForm = ({ verifyToken }: UpdatePasswordFormProps) => {
    const { t } = useTranslation();
    const router = useRouter();

    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const isValidPassword = password === '' || PASSWORD_REGEX.test(password);
    const [hasConfirmError, setHasConfirmError] = React.useState(false);

    const [isLoading, setIsLoading] = React.useState(false);
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!password || !isValidPassword || password !== passwordConfirm) {
            return;
        }
        setIsLoading(true);
        const { error } = await authClient.resetPassword({
            newPassword: password,
            token: verifyToken,
        });
        setIsLoading(false);
        if (error) {
            sendToast({
                message: t('common.errors.unknown'),
                type: 'error',
            });
        } else {
            router.push('/login');
            sendToast({
                message: t('update_password_page.toast_message.update_success'),
                type: 'success',
            });
        }
    };

    return (
        <Form className="login-form" autoComplete="off" onSubmit={onSubmit}>
            <Field
                name="new_password"
                label={t('update_password_page.password_field.label')}
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
                helperText={!isValidPassword ? t('update_password_page.password_field.error') : ''}
                helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
            />
            <Field
                name="new_password_confirm"
                label={t('update_password_page.password_confirm_field.label')}
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
                helperText={hasConfirmError ? t('update_password_page.password_confirm_field.error') : ''}
                helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
            />
            <Button label={t('update_password_page.submit_button.label')} variant="contained" color="secondary" type="submit"></Button>
            <Loader isLoading={isLoading} />
        </Form>
    );
};
