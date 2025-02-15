'use client';

import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { createUser } from 'src/actions/users/create-user';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/contexts/translationContext';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

interface SignUpFormProps {
    inviteCode: string;
}
export const SignUpForm = ({ inviteCode }: SignUpFormProps) => {
    const router = useRouter();
    const { t } = useTranslation();

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
        if (!email || !isEmailValid || !name || !password || !isPasswordValid || password !== passwordConfirm) {
            return;
        }
        const error = await createUser({ name, email, password, inviteCode });
        if (error) {
            sendToast({
                message: error,
                type: 'error',
            });
        } else {
            router.push('/');
        }
    };

    return (
        <>
            <Form onSubmit={onSubmit} className="signup-form" autoComplete="off">
                <Field
                    name="username"
                    label={t('signup_name')}
                    input={
                        <Input
                            id="username"
                            name="username"
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
                    label={t('signup_email')}
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
                    helperText={!isEmailValid ? t('signup_email_error') : ''}
                    helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                />
                <Field
                    name="password"
                    label={t('account_new_password')}
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
                    helperText={!isPasswordValid ? t('signup_password_error') : ''}
                    helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                />
                <Field
                    name="password_confirm"
                    label={t('signup_password_confirm')}
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
                    helperText={hasConfirmError ? t('signup_password_confirm_error') : ''}
                    helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                />
                <Button label={t('signup_button')} variant="contained" color={'secondary'} type="submit" value="Submit"></Button>
            </Form>
            <div className="text-center" style={{ marginBottom: '2rem' }}>
                {t('signup_already')} <Link href="/login">{t('login_connect')}</Link>
            </div>
            <Loader isLoading={false} />
        </>
    );
};
