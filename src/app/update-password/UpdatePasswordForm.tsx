'use client';

import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { authClient } from '@frontend/lib/auth-client';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

interface UpdatePasswordFormProps {
    verifyToken: string;
}
export const UpdatePasswordForm = ({ verifyToken }: UpdatePasswordFormProps) => {
    const t = useExtracted('update-password.UpdatePasswordForm');
    const commonT = useExtracted('common');
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
                message: commonT('Une erreur est survenue...'),
                type: 'error',
            });
        } else {
            router.push('/login');
            sendToast({
                message: t('Le mot de passe de votre compte a été réinitialisé avec succès !'),
                type: 'success',
            });
        }
    };

    return (
        <Form className="login-form" autoComplete="off" onSubmit={onSubmit}>
            <Field
                name="new_password"
                label={t('Nouveau mot de passe')}
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
                helperText={
                    !isValidPassword
                        ? t(
                              'Mot de passe trop faible. Il doit contenir au moins 8 caractères avec des lettres minuscules, majuscules et des chiffres.',
                          )
                        : ''
                }
                helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
            />
            <Field
                name="new_password_confirm"
                label={t('Confirmer le nouveau mot de passe')}
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
                helperText={hasConfirmError ? t('Mots de passe différents.') : ''}
                helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
            />
            <Button label={t('Réinitialiser')} variant="contained" color="secondary" type="submit"></Button>
            <Loader isLoading={isLoading} />
        </Form>
    );
};
