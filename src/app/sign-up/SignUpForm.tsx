'use client';

import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Link } from '@frontend/components/navigation/Link';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

interface SignUpFormProps {
    inviteCode: string;
}
export const SignUpForm = ({ inviteCode }: SignUpFormProps) => {
    const router = useRouter();

    const t = useExtracted('sign-up.SignUpForm');
    const commonT = useExtracted('common');

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [isEmailValid, setIsEmailValid] = React.useState(true);
    const [password, setPassword] = React.useState('');
    const [isPasswordValid, setIsPasswordValid] = React.useState(true);
    const [passwordConfirm, setPasswordConfirm] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [hasConfirmError, setHasConfirmError] = React.useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formElement = e.currentTarget instanceof HTMLFormElement ? e.currentTarget : null;
        if (!email || !isEmailValid || !name || !password || !isPasswordValid || password !== passwordConfirm || formElement === null) {
            return;
        }
        try {
            const response = await fetch(`/api/auth/sign-up/email?inviteToken=${inviteCode}`, {
                method: 'POST',
                body: new FormData(formElement),
            });
            if (!response.ok) {
                sendToast({
                    message: commonT('Une erreur est survenue...'),
                    type: 'error',
                });
            } else {
                router.push('/');
                router.refresh(); // refresh the layout
            }
        } catch {
            sendToast({
                message: commonT('Une erreur est survenue...'),
                type: 'error',
            });
        }
    };

    return (
        <>
            <Form onSubmit={onSubmit} className="signup-form" autoComplete="off">
                <Field
                    name="username"
                    label={t('Nom du professeur')}
                    input={
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            color="secondary"
                            required
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            isFullWidth
                        />
                    }
                />
                <Field
                    name="email"
                    label={t('E-mail du professeur')}
                    input={
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            color="secondary"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            onBlur={(event) => {
                                setIsEmailValid(event.target.value.length === 0 || EMAIL_REGEX.test(event.target.value));
                            }}
                            isFullWidth
                            hasError={!isEmailValid}
                        />
                    }
                    helperText={!isEmailValid ? t('E-mail invalide.') : ''}
                    helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                />
                <Field
                    name="password"
                    label={t('Mot de passe')}
                    input={
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            color="secondary"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                            onBlur={(event) => {
                                setIsPasswordValid(password.length === 0 || PASSWORD_REGEX.test(event.target.value));
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
                            hasError={!isPasswordValid}
                        />
                    }
                    helperText={
                        !isPasswordValid
                            ? t(
                                  'Mot de passe trop faible. Il doit contenir au moins 8 charactères avec des lettres minuscules, majuscules et des chiffres.',
                              )
                            : ''
                    }
                    helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                />
                <Field
                    name="password_confirm"
                    label={t('Confirmer le mot de passe')}
                    input={
                        <Input
                            style={{ marginTop: '1rem' }}
                            type={showPassword ? 'text' : 'password'}
                            color="secondary"
                            id="password_confirm"
                            name="password_confirm"
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
                <Button label={t("S'inscrire !")} variant="contained" color={'secondary'} type="submit" value="Submit"></Button>
            </Form>
            <div className="text-center" style={{ marginBottom: '2rem' }}>
                {t('Compte déjà créé ?')} <Link href="/login">{t('Se connecter')}</Link>
            </div>
            <Loader isLoading={false} />
        </>
    );
};
