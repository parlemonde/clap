import { useRouter } from 'next/router';
import React from 'react';

import { Button, Link, TextField, Typography, Backdrop, CircularProgress } from '@mui/material';

import { useTranslation } from 'src/i18n/useTranslation';
import { axiosRequest } from 'src/utils/axiosRequest';

const errorMessages = {
    0: 'login_unknown_error',
    1: 'login_email_error',
};

const ResetPassword: React.FunctionComponent = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [email, setEmail] = React.useState<string>('');
    const [errorCode, setErrorCode] = React.useState<number>(-1);
    const [successMsg, setSuccessMsg] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false);

    const handleUserNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        setErrorCode(-1);
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorCode(-1);
        setSuccessMsg('');
        setLoading(true);
        const response = await axiosRequest({
            method: 'POST',
            url: '/login/reset-password',
            data: {
                email,
            },
        });
        setLoading(false);
        if (response.success) {
            setSuccessMsg('forgot_password_success');
        } else {
            setErrorCode(response.status === 400 ? 1 : response.errorCode);
        }
    };

    const handleLinkClick = (path: string) => (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(path);
    };

    return (
        <div className="text-center">
            <Typography color="primary" variant="h1" style={{ marginTop: '2rem' }}>
                {t('forgot_password_title')}
            </Typography>
            <form className="login-form" noValidate autoComplete="off" onSubmit={submit}>
                {errorCode === 0 && (
                    <Typography variant="caption" color="error">
                        {t(errorMessages[0])}
                    </Typography>
                )}

                {successMsg.length > 0 && (
                    <Typography variant="caption" color="primary">
                        {t(successMsg)}
                    </Typography>
                )}

                <TextField
                    id="username"
                    name="username"
                    type="text"
                    color="secondary"
                    label={t('forgot_password_email')}
                    value={email}
                    onChange={handleUserNameInputChange}
                    variant="outlined"
                    fullWidth
                    error={errorCode === 1}
                    helperText={errorCode === 1 ? t(errorMessages[1]) : null}
                />

                <Button variant="contained" color="secondary" type="submit">
                    {t('forgot_password_button')}
                </Button>

                <div className="text-center">
                    <Link href="/login" onClick={handleLinkClick('/login')}>
                        {t('login_connect')}
                    </Link>
                </div>
            </form>
            <Backdrop sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default ResetPassword;
