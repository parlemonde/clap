import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Container } from 'src/components/layout/Container';
import { Checkbox, Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useTranslation } from 'src/i18n/useTranslation';
import { generateTemporaryToken } from 'src/utils/generate-temporary-token';
import { httpRequest } from 'src/utils/http-request';
import { clientId, ssoHost, ssoHostName } from 'src/utils/sso';
import { useQueryString } from 'src/utils/useQueryId';
import type { User } from 'types/models/user.type';

const errorMessages = {
    0: 'login_unknown_error',
    1: 'login_username_error',
    2: 'login_password_error',
    3: 'login_account_error',
    5: `Veuillez utiliser le login avec ${ssoHostName} pour votre compte`,
    6: 'Veuillez utiliser le login par email/mot de passe pour votre compte',
};

type LoginMutationRequest = {
    username: string;
    password: string;
    getRefreshToken?: boolean;
};

const LoginPage = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, setUser } = React.useContext(userContext);

    const [showPassword, setShowPassword] = React.useState(false);
    const [login, setLogin] = React.useState<LoginMutationRequest>({
        username: '',
        password: '',
        getRefreshToken: false,
    });
    const [errorCode, setErrorCode] = React.useState(-1);
    const [isLoading, setIsLoading] = React.useState(false);

    const stateQueryParam = useQueryString('state');
    const codeQueryParam = useQueryString('code');
    const { setIsCollaborationActive } = useCollaboration();

    const firstCall = React.useRef(false);
    const loginSSO = React.useCallback(
        async (code: string) => {
            if (firstCall.current === false) {
                firstCall.current = true;
                setIsCollaborationActive(false);
                setIsLoading(true);
                const response = await httpRequest<{ user: User }>({
                    method: 'POST',
                    url: `/login-sso-plm`,
                    data: {
                        code,
                    },
                });
                if (response.success) {
                    setUser(response.data.user);
                    router.push('/create');
                } else {
                    setErrorCode(response.errorCode);
                }
                setIsLoading(false);
            }
        },
        [setUser, router],
    );

    React.useEffect(() => {
        if (stateQueryParam && codeQueryParam) {
            const state = window.sessionStorage.getItem('oauth-state') || '';
            if (state === decodeURI(stateQueryParam)) {
                loginSSO(decodeURI(codeQueryParam)).catch();
            } else {
                setErrorCode(0);
            }
        }
    }, [stateQueryParam, codeQueryParam, loginSSO]);

    if (user !== null) {
        return <div></div>;
    }

    const onLogin = async () => {
        setIsCollaborationActive(false);
        setIsLoading(true);
        const response = await httpRequest<{ user: User }>({
            method: 'POST',
            url: `/login`,
            data: login,
        });
        if (response.success) {
            setUser(response.data.user);
            router.push('/create');
        } else {
            setErrorCode(response.errorCode);
        }
        setIsLoading(false);
    };

    const onLoginWithSSO = () => {
        if (!clientId || !ssoHost) {
            return;
        }
        setIsLoading(true);
        const state = generateTemporaryToken();
        window.sessionStorage.setItem('oauth-state', state);
        const url = `${ssoHost}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${
            window.location.href.split('?')[0]
        }&state=${state}`;
        window.location.replace(url);
    };

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t('login_title')}
            </Title>
            <Form className="login-form" onSubmit={onLogin}>
                {(errorCode === 0 || errorCode >= 3) && (
                    <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{t(errorMessages[errorCode as 0] || errorMessages[0])}</span>
                )}

                {ssoHost.length && clientId ? (
                    <>
                        <Button
                            label={`Se connecter avec ${ssoHostName}`}
                            variant="contained"
                            color="secondary"
                            onClick={onLoginWithSSO}
                            marginY="lg"
                        ></Button>
                        <div className="login__divider">
                            <div className="login__or">
                                <span style={{ fontSize: '1.2rem', padding: '0.25rem', backgroundColor: 'white' }}>OU</span>
                            </div>
                        </div>
                    </>
                ) : null}
                <Field
                    name="username"
                    label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{t('login_username')}</span>}
                    input={
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            color="secondary"
                            value={login.username}
                            onChange={(event) => {
                                setLogin({ ...login, username: event.target.value });
                                setErrorCode(-1);
                            }}
                            isFullWidth
                            required
                            hasError={errorCode === 1}
                        />
                    }
                    helperText={errorCode === 1 ? t(errorMessages[1]) : ''}
                    helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                ></Field>
                <Field
                    name="password"
                    label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{t('login_password')}</span>}
                    input={
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            color="secondary"
                            value={login.password}
                            onChange={(event) => {
                                setLogin({ ...login, password: event.target.value });
                                setErrorCode(-1);
                            }}
                            isFullWidth
                            required
                            hasError={errorCode === 2}
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
                        />
                    }
                    helperText={errorCode === 2 ? t(errorMessages[2]) : ''}
                ></Field>
                <Checkbox
                    name="remember-checkbox"
                    isChecked={login.getRefreshToken}
                    onChange={() => {
                        setLogin({ ...login, getRefreshToken: !login.getRefreshToken });
                    }}
                    label={t('login_remember_me')}
                />
                <Button label={t('login_connect')} variant="contained" color="secondary" type="submit" value="Submit"></Button>
                <Button label={t('login_student')} variant="outlined" color="secondary" type="button" onClick={() => router.push('/join')}></Button>
                <div className="text-center">
                    <Link href="/reset-password" className="color-primary">
                        {t('login_forgot_password')}
                    </Link>
                </div>
                <div className="text-center">
                    {t('login_new')}{' '}
                    <Link href="/sign-up" className="color-primary">
                        {t('login_signup')}
                    </Link>
                </div>
            </Form>
            <Loader isLoading={isLoading} />
        </Container>
    );
};

export default LoginPage;
