import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import qs from 'query-string';
import React from 'react';

import { useLanguages } from 'src/api/languages/languages.list';
import type { POSTParams as PostUserArgs } from 'src/api/users/users.post';
import { useCreateUserMutation } from 'src/api/users/users.post';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { getQueryString } from 'src/utils/get-query-string';
import { httpRequest } from 'src/utils/http-request';
import { useQueryString } from 'src/utils/useQueryId';

type NewUser = Omit<PostUserArgs, 'inviteCode'> & { passwordConfirm: string };

// eslint-disable-next-line no-control-regex
const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

const checks = {
    email: (value: string) => emailRegex.test(value),
    pseudo: (value: string) => value.length > 0,
    password: (value: string) => strongPassword.test(value),
    passwordConfirm: (value: string, password: string) => value === password,
};

const isPseudoAvailable = async (pseudo: string): Promise<boolean> => {
    const response = await httpRequest<{ available: boolean }>({
        method: 'GET',
        url: `/users/test-pseudo/${pseudo}`,
    });
    if (response.success) {
        return response.data.available;
    }
    return false;
};

const checkInviteCode = async (code: string): Promise<boolean> => {
    const response = await httpRequest<{ isValid: boolean }>({
        method: 'GET',
        url: `/users/check-invite/${code}`,
    });
    if (response.success) {
        return response.data.isValid;
    }
    return false;
};

const SignupPage = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { user: currentUser, setUser: setCurrentUser } = React.useContext(userContext);
    const isLoggedIn = currentUser !== null;
    const { languages } = useLanguages();
    const [user, setUser] = React.useState<NewUser>({
        languageCode: 'fr',
        email: '',
        pseudo: '',
        password: '',
        passwordConfirm: '',
    });
    const [errors, setErrors] = React.useState({
        email: false,
        pseudo: false,
        pseudoNotAvailable: false,
        password: false,
        passwordConfirm: false,
        global: false,
    });
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [inviteCode, setInviteCode] = React.useState<string | null>(null);
    const [inviteCodeValue, setInviteCodeValue] = React.useState<string>('');
    const [inviteCodeError, setInviteCodeError] = React.useState<boolean>(false);
    const inviteCodeURL = useQueryString('inviteCode');

    const createUserMutation = useCreateUserMutation();
    const isLoading = createUserMutation.isLoading;
    const handleSubmit = async () => {
        // Check entries
        const userKeys: Array<'email' | 'pseudo' | 'password' | 'passwordConfirm'> = ['email', 'pseudo', 'password', 'passwordConfirm'];
        let isFormValid = true;
        for (const userKey of userKeys) {
            const value = user[userKey];
            if (value === undefined || !checks[userKey](value, user.password || '')) {
                isFormValid = false;
                setErrors((e) => ({ ...e, [userKey]: true }));
            }
        }
        if (user.pseudo.length !== 0 && !(await isPseudoAvailable(user.pseudo))) {
            isFormValid = false;
            setErrors((e) => ({ ...e, pseudoNotAvailable: true }));
        }
        if (!isFormValid) {
            setErrors((e) => ({ ...e, global: true }));
            window.scrollTo(0, 0);
            return;
        }

        // Make request
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { passwordConfirm, ...data } = user;
            const { user: newUser } = await createUserMutation.mutateAsync({ ...data, inviteCode: inviteCode || '' });
            setCurrentUser(newUser);
            router.push('/create');
        } catch (err) {
            //
            console.error(err);
        }
    };

    const handleInviteCodeSubmit = async () => {
        if (!(await checkInviteCode(inviteCodeValue))) {
            setInviteCodeError(true);
            return;
        }
        setInviteCode(inviteCodeValue);
    };

    const handleInviteFromURL = React.useCallback(async (code: string) => {
        if (code.length > 0) {
            if (!(await checkInviteCode(code))) {
                setInviteCodeValue(code);
                setInviteCodeError(true);
                return;
            }
            setInviteCode(code);
        }
    }, []);

    const onInviteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value.startsWith('http://') || value.startsWith('https://')) {
            setInviteCodeValue(getQueryString(qs.parseUrl(value).query.inviteCode) || value);
        } else {
            setInviteCodeValue(value);
        }
        setInviteCodeError(false);
    };

    const handleInputChange = (userKey: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setUser({ ...user, [userKey]: event.target.value });
        setErrors((e) => ({ ...e, [userKey]: false, global: false }));
    };
    const handleInputValidations = (userKey: 'email' | 'pseudo' | 'password' | 'passwordConfirm') => (event: React.FocusEvent<HTMLInputElement>) => {
        const value = event.target.value || '';
        setErrors((e) => ({
            ...e,
            [userKey]: value.length !== 0 && !checks[userKey](value, user.password || ''),
        }));
        if (userKey === 'pseudo' && value.length !== 0) {
            isPseudoAvailable(value).then((result: boolean) => {
                setErrors((e) => ({ ...e, pseudoNotAvailable: !result }));
            });
        }
    };

    React.useEffect(() => {
        handleInviteFromURL(inviteCodeURL || '').catch();
    }, [inviteCodeURL, handleInviteFromURL]);

    React.useEffect(() => {
        if (isLoggedIn) {
            router.push('/create');
        }
    }, [isLoggedIn, router]);
    if (isLoggedIn) {
        return null;
    }

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop="lg" marginBottom="md">
                {t('signup_title')}
            </Title>

            {inviteCode === null ? (
                <Form onSubmit={handleInviteCodeSubmit} className="signup-form" autoComplete="off" style={{ textAlign: 'left' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '1rem' }}>{t('signup_invite_title')}</label>
                    <Field
                        marginTop="md"
                        name="inviteCode"
                        label={t('signup_invite_placeholder')}
                        input={
                            <Input
                                id="inviteCode"
                                name="inviteCode"
                                type="text"
                                color="secondary"
                                required
                                value={inviteCodeValue}
                                onChange={onInviteChange}
                                isFullWidth
                                hasError={inviteCodeError}
                            />
                        }
                        helperText={inviteCodeError ? t('signup_invite_error') : ''}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    ></Field>
                    <Button label={t('continue')} variant="contained" color="secondary" type="submit" value="Submit"></Button>
                </Form>
            ) : (
                <Form onSubmit={handleSubmit} className="signup-form" autoComplete="off">
                    {errors.global && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{t('signup_error_msg')}</span>}
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
                                value={user.email || ''}
                                onChange={handleInputChange('email')}
                                onBlur={handleInputValidations('email')}
                                isFullWidth
                                hasError={errors.email}
                            />
                        }
                        helperText={errors.email ? t('signup_email_error') : ''}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    />
                    <Field
                        name="username"
                        label={t('signup_pseudo')}
                        input={
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                color="secondary"
                                required
                                value={user.pseudo || ''}
                                onChange={handleInputChange('pseudo')}
                                onBlur={handleInputValidations('pseudo')}
                                isFullWidth
                                hasError={errors.pseudo || errors.pseudoNotAvailable}
                            />
                        }
                        helperText={
                            (errors.pseudo ? `${t('signup_required')} | ` : errors.pseudoNotAvailable ? `${t('signup_pseudo_error')} |` : '') +
                            t('signup_pseudo_help')
                        }
                        helperTextStyle={{ textAlign: 'left', color: errors.pseudo || errors.pseudoNotAvailable ? 'rgb(211, 47, 47)' : 'inherit' }}
                    />
                    <Field
                        name="language"
                        label={t('signup_language')}
                        input={
                            <Select isFullWidth color="secondary" value={user.languageCode} onChange={handleInputChange('languageCode')}>
                                {languages.map((l) => (
                                    <option value={l.value} key={l.value}>
                                        {l.label}
                                    </option>
                                ))}
                            </Select>
                        }
                    />
                    <Field
                        name="password"
                        label={t('login_password')}
                        input={
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                color="secondary"
                                id="password"
                                name="password"
                                value={user.password || ''}
                                required
                                onChange={handleInputChange('password')}
                                onBlur={handleInputValidations('password')}
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
                                hasError={errors.password}
                            />
                        }
                        helperText={errors.password ? t('signup_password_error') : ''}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    />
                    <Field
                        name="passwordComfirm"
                        label={t('signup_password_confirm')}
                        input={
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                color="secondary"
                                id="passwordComfirm"
                                name="passwordComfirm"
                                required
                                value={user.passwordConfirm || ''}
                                onChange={handleInputChange('passwordConfirm')}
                                onBlur={handleInputValidations('passwordConfirm')}
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
                                hasError={errors.passwordConfirm}
                            />
                        }
                        helperText={errors.passwordConfirm ? t('signup_password_confirm_error') : ''}
                        helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                    />
                    <Button label={t('signup_button')} variant="contained" color={'secondary'} type="submit" value="Submit"></Button>
                </Form>
            )}

            <div className="text-center" style={{ marginBottom: '2rem' }}>
                {t('signup_already')}{' '}
                <Link passHref href="/login">
                    <a>{t('login_connect')}</a>
                </Link>
            </div>
            <Loader isLoading={isLoading} />
        </Container>
    );
};

export default SignupPage;
