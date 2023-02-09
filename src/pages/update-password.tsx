import { useRouter } from 'next/router';
import React from 'react';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, TextField, Typography, InputAdornment, IconButton } from '@mui/material';

import { useUpdateUserPasswordMutation } from 'src/api/users/users.password';
import { Loader } from 'src/components/layout/Loader';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { useQueryString } from 'src/utils/useQueryId';

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

const UpdatePassword = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { setUser } = React.useContext(userContext);
    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState({
        password: false,
        passwordConfirm: false,
        global: false,
    });

    // -- get email and verify token from query strings --
    const email = useQueryString('email');
    const verifyToken = useQueryString('verify-token');
    const isUrlValid = email !== undefined && verifyToken !== undefined;
    React.useEffect(() => {
        if (!isUrlValid) {
            router.push('/create');
        }
    }, [router, isUrlValid]);

    const updatePasswordMutation = useUpdateUserPasswordMutation();
    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!password) {
            return;
        }

        // [1] Check form validity
        const isPasswordValid = strongPassword.test(password);
        const isPasswordConfirmValid = password === passwordConfirm;
        setErrors({
            password: !isPasswordValid,
            passwordConfirm: !isPasswordConfirmValid,
            global: false,
        });
        if (!isPasswordValid || !isPasswordConfirmValid) {
            return;
        }

        // [2] Update password
        try {
            const { user } = await updatePasswordMutation.mutateAsync({
                password,
                email: email || '',
                verifyToken: verifyToken || '',
            });
            setUser(user);
            router.push('/create');
        } catch (err) {
            console.error(err);
            setErrors({
                password: false,
                passwordConfirm: false,
                global: true,
            });
        }
    };

    return (
        <div className="text-center">
            <Typography color="primary" variant="h1" style={{ marginTop: '2rem' }}>
                {t('update_password')}
            </Typography>{' '}
            <form className="login-form" noValidate autoComplete="off" onSubmit={onSubmit}>
                {errors.global && (
                    <Typography variant="caption" color="error">
                        {t('update_password_error')}
                    </Typography>
                )}
                <TextField
                    type={showPassword ? 'text' : 'password'}
                    color="secondary"
                    id="password"
                    name="password"
                    label={t('login_password')}
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value);
                        setErrors((prev) => ({ ...prev, password: false }));
                    }}
                    onBlur={() => {
                        setErrors((prev) => ({ ...prev, password: !strongPassword.test(password) }));
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
                                    {showPassword ? <Visibility /> : <VisibilityOff />}{' '}
                                </IconButton>{' '}
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                    error={errors.password}
                    helperText={errors.password ? t('signup_password_error') : ''}
                />
                <TextField
                    type={showPassword ? 'text' : 'password'}
                    color="secondary"
                    id="passwordComfirm"
                    name="passwordComfirm"
                    label={t('signup_password_confirm')}
                    value={passwordConfirm}
                    onChange={(event) => {
                        setPasswordConfirm(event.target.value);
                        setErrors((prev) => ({ ...prev, passwordConfirm: false }));
                    }}
                    onBlur={() => {
                        setErrors((prev) => ({ ...prev, passwordConfirm: passwordConfirm !== password }));
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
                                    {showPassword ? <Visibility /> : <VisibilityOff />}{' '}
                                </IconButton>{' '}
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                    error={errors.passwordConfirm}
                    helperText={errors.passwordConfirm ? t('signup_password_confirm_error') : ''}
                />
                <Button variant="contained" color="secondary" type="submit">
                    {t('validate')}
                </Button>
            </form>
            <Loader isLoading={updatePasswordMutation.isLoading} />
        </div>
    );
};

export default UpdatePassword;
