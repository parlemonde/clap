import { useRouter } from 'next/router';
import React from 'react';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, TextField, Typography, InputAdornment, IconButton } from '@mui/material';

import { useTranslation } from 'src/i18n/useTranslation';
import { UserServiceContext } from 'src/services/UserService';

interface User {
    email: string;
    verifyToken: string;
    password: string;
    passwordConfirm: string;
}

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

const checks = {
    password: (value: string) => strongPassword.test(value),
    passwordConfirm: (value: string, user: User) => value === user.password,
};

const UpdatePassword: React.FunctionComponent = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { updatePassword } = React.useContext(UserServiceContext);
    const [user, setUser] = React.useState<User>({
        email: (router.query.email as string) || '',
        verifyToken: (router.query['verify-token'] as string) || '',
        password: '',
        passwordConfirm: '',
    });
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState({
        password: false,
        passwordConfirm: false,
        global: false,
    });

    const submit = async (event: React.MouseEvent) => {
        event.preventDefault();
        // Check form validity
        let isFormValid = true;
        for (const userKey of ['password', 'passwordConfirm'] as const) {
            if (!checks[userKey](user[userKey], user)) {
                isFormValid = false;
                setErrors((e) => ({ ...e, [userKey]: true }));
            }
        }
        if (!isFormValid) {
            setErrors((e) => ({ ...e, global: true }));
            return;
        }
        const response = await updatePassword(user, user.verifyToken);
        if (response.success) {
            // todo success msg
            router.push('/create');
        } else {
            // todo error
        }
    };

    const handleInputChange = (userKey: 'password' | 'passwordConfirm') => (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [userKey]: event.target.value });
        setErrors((e) => ({
            ...e,
            [userKey]: false,
            global: false,
        }));
    };

    const handleInputValidations = (userKey: 'password' | 'passwordConfirm') => (event: React.FocusEvent<HTMLInputElement>) => {
        const value = event.target.value || '';
        setErrors((e) => ({
            ...e,
            [userKey]: value.length !== 0 && !checks[userKey](value, user),
        }));
    };

    const handleToggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    React.useEffect(() => {
        if (user.email.length === 0 || user.verifyToken.length === 0) {
            router.push('/create');
        }
    }, [user, router]);

    return (
        <div className="text-center">
            <Typography color="primary" variant="h1" style={{ marginTop: '2rem' }}>
                {t('update_password')}
            </Typography>{' '}
            <form className="login-form" noValidate autoComplete="off">
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
                    value={user.password || ''}
                    onChange={handleInputChange('password')}
                    onBlur={handleInputValidations('password')}
                    variant="outlined"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={handleToggleShowPassword} edge="end">
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
                    value={user.passwordConfirm || ''}
                    onChange={handleInputChange('passwordConfirm')}
                    onBlur={handleInputValidations('passwordConfirm')}
                    variant="outlined"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={handleToggleShowPassword} edge="end">
                                    {showPassword ? <Visibility /> : <VisibilityOff />}{' '}
                                </IconButton>{' '}
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                    error={errors.passwordConfirm}
                    helperText={errors.passwordConfirm ? t('signup_password_confirm_error') : ''}
                />
                <Button variant="contained" color="secondary" onClick={submit}>
                    {t('validate')}
                </Button>
            </form>
        </div>
    );
};

export default UpdatePassword;
