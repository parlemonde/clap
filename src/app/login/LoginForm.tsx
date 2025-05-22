'use client';

import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { login } from 'src/actions/authentication/login';
import { loginWithSSO } from 'src/actions/authentication/login-with-sso';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Link } from 'src/components/navigation/Link';
import { FormLoader, Loader } from 'src/components/ui/Loader';
import { useTranslation } from 'src/contexts/translationContext';

interface LoginFormProps {
    ssoHost: string;
    clientId: string;
    stateQueryParam?: string;
    codeQueryParam?: string;
}

const clearSSOState = () => {
    const url = new URL(window.document.URL);
    url.searchParams.delete('state');
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.toString());
};

export const LoginForm = ({ ssoHost, clientId, stateQueryParam, codeQueryParam }: LoginFormProps) => {
    const [message, formAction] = React.useActionState(login, '');
    const { t } = useTranslation();

    const [showPassword, setShowPassword] = React.useState(false);
    const [ssoErrorMessage, setSsoErrorMessage] = React.useState('');
    const [isConnectingWithSso, setIsConnectingWithSso] = React.useState(stateQueryParam !== undefined && codeQueryParam !== undefined);

    const onLoginWithSSO = () => {
        setIsConnectingWithSso(true);
        const state = generateTemporaryToken();
        window.sessionStorage.setItem('oauth-state', state);
        const url = `${ssoHost}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${
            window.location.href.split('?')[0]
        }&state=${state}`;
        window.location.replace(url);
    };

    React.useEffect(() => {
        if (!stateQueryParam || !codeQueryParam) {
            // If 1 of the query params is present, but not both, clear the state
            if (stateQueryParam || codeQueryParam) {
                clearSSOState();
                setIsConnectingWithSso(false);
            }
            return;
        }
        const state = window.sessionStorage.getItem('oauth-state') || '';
        if (state !== decodeURI(stateQueryParam || '')) {
            setSsoErrorMessage("Couldn't connect with SSO.");
            clearSSOState();
            setIsConnectingWithSso(false);
            return;
        }
        loginWithSSO(codeQueryParam)
            .then((errorMsg) => {
                if (errorMsg) {
                    setSsoErrorMessage(errorMsg);
                }
                clearSSOState();
                setIsConnectingWithSso(false);
            })
            .catch(console.error);
    }, [stateQueryParam, codeQueryParam]);

    const ssoHostName = ssoHost.replace(/(^\w+:|^)\/\//, '');

    return (
        <Form className="login-form" action={formAction}>
            {message && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{message}</span>}
            {ssoErrorMessage && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{ssoErrorMessage}</span>}
            {ssoHost && clientId ? (
                <>
                    <Button
                        label={t('login_page.sso_button.label', { ssoHostName })}
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
                name="email"
                label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{t('login_page.email_field.label')}</span>}
                input={<Input id="email" name="email" type="text" color="secondary" isFullWidth required disabled={isConnectingWithSso} />}
            ></Field>
            <Field
                name="password"
                label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{t('login_page.password_field.label')}</span>}
                input={
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        color="secondary"
                        disabled={isConnectingWithSso}
                        isFullWidth
                        required
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
            ></Field>
            <Button label={t('login_page.connect_button.label')} variant="contained" color="secondary" type="submit" value="Submit"></Button>
            <Link href="/join" passHref legacyBehavior>
                <Button marginTop="lg" as="a" isFullWidth label={t('login_page.student_button.label')} variant="outlined" color="secondary"></Button>
            </Link>
            <div className="text-center">
                <Link href="/reset-password" className="color-primary">
                    {t('login_page.forgot_password_link.label')}
                </Link>
            </div>
            <div className="text-center" style={{ marginBottom: '2rem' }}>
                {t('login_page.no_account.text')} <Link href="/sign-up">{t('login_page.no_account.link')}</Link>
            </div>
            <div className="loader-wrapper">
                <FormLoader />
            </div>
            <Loader isLoading={isConnectingWithSso} />
        </Form>
    );
};

/**
 * Returns a random token. Browser only!
 * @param length length of the returned token.
 */
function generateTemporaryToken(length: number = 20): string {
    const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const cryptoObj = !process.browser
        ? null
        : window.crypto || 'msCrypto' in window
          ? (window as Window & typeof globalThis & { msCrypto: Crypto }).msCrypto
          : null; // for IE 11
    if (!cryptoObj) {
        return Array<string>(length)
            .fill(validChars)
            .map((x) => x[Math.floor(Math.random() * x.length)])
            .join('');
    }
    let array = new Uint8Array(length);
    cryptoObj.getRandomValues(array);
    array = array.map((x) => validChars.charCodeAt(x % validChars.length));
    const randomState = String.fromCharCode.apply(null, [...array]);
    return randomState;
}
