import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    FormControlLabel,
    Checkbox,
    Button,
    Link as MaterialLink,
    Backdrop,
    CircularProgress,
} from '@mui/material';

import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { axiosRequest } from 'src/utils/axiosRequest';
import { getQueryString } from 'src/utils/get-query-string';
import type { User } from 'types/models/user.type';

const ssoHostName = 'foo'; // TODO

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

    const redirect = React.useMemo(() => {
        return getQueryString(router.query.redirect) || '/create';
    }, [router]);

    if (user !== null) {
        return <div></div>;
    }

    const onLogin = async (event: React.MouseEvent) => {
        event.preventDefault();
        setIsLoading(true);
        const response = await axiosRequest<{ user: User }>({
            method: 'POST',
            url: `/login`,
            data: login,
        });
        if (response.success) {
            setUser(response.data.user);
            router.push(redirect);
        } else {
            setErrorCode(response.errorCode);
        }
        setIsLoading(false);
    };

    return (
        <div className="text-center">
            <Typography color="primary" variant="h1" style={{ marginTop: '2rem' }}>
                {t('login_title')}
            </Typography>
            <form className="login-form" noValidate onSubmit={onLogin}>
                {(errorCode === 0 || errorCode >= 3) && (
                    <Typography variant="caption" color="error">
                        {t(errorMessages[errorCode as 0] || errorMessages[0])}
                    </Typography>
                )}
                {/* TODO PLMO LOGIN */}
                <TextField
                    id="username"
                    name="username"
                    type="text"
                    color="secondary"
                    label={t('login_username')}
                    value={login.username}
                    onChange={(event) => {
                        setLogin({ ...login, username: event.target.value });
                        setErrorCode(-1);
                    }}
                    variant="outlined"
                    fullWidth
                    error={errorCode === 1}
                    helperText={errorCode === 1 ? t(errorMessages[1]) : null}
                />
                <TextField
                    type={showPassword ? 'text' : 'password'}
                    color="secondary"
                    id="password"
                    name="password"
                    label={t('login_password')}
                    value={login.password}
                    onChange={(event) => {
                        setLogin({ ...login, password: event.target.value });
                        setErrorCode(-1);
                    }}
                    variant="outlined"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => {
                                        setShowPassword(!showPassword);
                                    }}
                                    edge="end"
                                >
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                    error={errorCode === 2}
                    helperText={errorCode === 2 ? t(errorMessages[2]) : null}
                />
                <div>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={login.getRefreshToken}
                                onChange={() => {
                                    setLogin({ ...login, getRefreshToken: !login.getRefreshToken });
                                }}
                                value={login.getRefreshToken}
                            />
                        }
                        label={t('login_remember_me')}
                    />
                </div>
                <Button variant="contained" color="secondary" type="submit" value="Submit">
                    {t('login_connect')}
                </Button>
                <div className="text-center">
                    <Link href="/reset-password" passHref>
                        <MaterialLink>{t('login_forgot_password')}</MaterialLink>
                    </Link>
                </div>
                <div className="text-center">
                    {t('login_new')}{' '}
                    <Link href="/sign-up" passHref>
                        <MaterialLink>{t('login_signup')}</MaterialLink>
                    </Link>
                </div>
            </form>
            <Backdrop style={{ zIndex: 2000, color: 'white' }} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default LoginPage;
