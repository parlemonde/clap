'use client';

import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React from 'react';

import { updateUserPassword } from 'src/actions/users/update-password';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/contexts/translationContext';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

interface UpdatePasswordFormProps {
    email: string;
    verifyToken: string;
}
export const UpdatePasswordForm = ({ email, verifyToken }: UpdatePasswordFormProps) => {
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
        const success = await updateUserPassword(email, verifyToken, password);
        setIsLoading(false);
        if (success) {
            router.push('/login');
            sendToast({
                message: t('update_password_success'),
                type: 'success',
            });
        } else {
            sendToast({
                message: t('unknown_error'),
                type: 'error',
            });
        }
    };

    return (
        <Form className="login-form" autoComplete="off" onSubmit={onSubmit}>
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
            <Button label={t('validate')} variant="contained" color="secondary" type="submit"></Button>
            <Loader isLoading={isLoading} />
        </Form>
    );
};
