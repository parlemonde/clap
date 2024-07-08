'use client';

import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { redirect } from 'next/navigation';
import * as React from 'react';
import { useFormState } from 'react-dom';

import { login } from 'src/actions/authentication/login';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { FormLoader } from 'src/components/ui/Loader';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';

export default function LoginPage() {
    const [message, formAction] = useFormState(login, '');
    const { t } = useTranslation();

    const [showPassword, setShowPassword] = React.useState(false);

    const { user } = React.useContext(userContext);
    if (user) {
        redirect('/');
    }

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t('login_title')}
            </Title>
            <Form className="login-form" action={formAction}>
                {message && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{message}</span>}
                <Field
                    name="email"
                    label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{t('login_username')}</span>}
                    input={<Input id="email" name="email" type="text" color="secondary" isFullWidth required />}
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
                <Button label={t('login_connect')} variant="contained" color="secondary" type="submit" value="Submit"></Button>
                <div className="loader-wrapper">
                    <FormLoader />
                </div>
            </Form>
        </Container>
    );
}
