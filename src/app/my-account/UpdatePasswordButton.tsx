'use client';

import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Divider } from '@frontend/components/layout/Divider';
import { Field, Input } from '@frontend/components/layout/Form';
import { Modal } from '@frontend/components/layout/Modal';
import { authClient } from '@frontend/lib/auth-client';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

export const UpdatePasswordButton = () => {
    const t = useExtracted('my-account.UpdatePasswordButton');
    const commonT = useExtracted('common');
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [updateErrorMessage, setUpdateErrorMessage] = React.useState<string | null>(null);

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
        const { error } = await authClient.changePassword({
            currentPassword: oldPassword,
            newPassword: password,
            revokeOtherSessions: true,
        });
        setIsLoading(false);
        if (error) {
            setUpdateErrorMessage('Echec de la mise à jour du mot de passe');
        } else {
            setOldPassword('');
            setPassword('');
            setPasswordConfirm('');
            setIsUpdateModalOpen(false);
        }
    };

    return (
        <>
            <Button
                label={t('Changer mon mot de passe')}
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
                confirmLabel={commonT('Modifier')}
                cancelLabel={commonT('Annuler')}
                title={t('Changer mon mot de passe')}
                onOpenAutoFocus={false}
                isFullWidth
            >
                <div id="mdp-dialog-description">
                    {updateErrorMessage && <p style={{ color: 'var(--error-color)', marginBottom: 4, textAlign: 'center' }}>{updateErrorMessage}</p>}
                    <Field
                        name="old_password"
                        label={t('Mot de passe actuel')}
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
                        helperText={hasConfirmError ? t('Mots de passe différents') : ''}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    />
                </div>
            </Modal>
        </>
    );
};
