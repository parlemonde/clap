import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import React from 'react';

import { useUpdateUserPasswordMutation } from 'src/api/users/users.password';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';
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
    const onSubmit = async () => {
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
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop="lg" marginBottom="md">
                {t('update_password')}
            </Title>{' '}
            <Form className="login-form" autoComplete="off" onSubmit={onSubmit}>
                {errors.global && <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{t('update_password_error')}</span>}
                <Field
                    name="password"
                    label={t('login_password')}
                    input={
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            color="secondary"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                setErrors((prev) => ({ ...prev, password: false }));
                            }}
                            onBlur={() => {
                                setErrors((prev) => ({ ...prev, password: !strongPassword.test(password) }));
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
                            required
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
                            value={passwordConfirm}
                            onChange={(event) => {
                                setPasswordConfirm(event.target.value);
                                setErrors((prev) => ({ ...prev, passwordConfirm: false }));
                            }}
                            onBlur={() => {
                                setErrors((prev) => ({ ...prev, passwordConfirm: passwordConfirm !== password }));
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
                            required
                            iconAdornmentProps={{ position: 'right' }}
                            isFullWidth
                            hasError={errors.passwordConfirm}
                        />
                    }
                    helperText={errors.passwordConfirm ? t('signup_password_confirm_error') : ''}
                    helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                />
                <Button label={t('validate')} variant="contained" color="secondary" type="submit"></Button>
            </Form>
            <Loader isLoading={updatePasswordMutation.isLoading} />
        </Container>
    );
};

export default UpdatePassword;
