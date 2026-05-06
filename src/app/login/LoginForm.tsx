'use client';

import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Link } from '@frontend/components/navigation/Link';
import { FormLoader } from '@frontend/components/ui/Loader';
import { authClient } from '@frontend/lib/auth-client';
import { login } from '@server-actions/authentication/login';

interface LoginFormProps {
    provider: string;
}

export const LoginForm = ({ provider }: LoginFormProps) => {
    const [message, formAction] = React.useActionState(login, '');
    const tx = useExtracted('login.LoginForm');

    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <Form className="login-form" action={formAction}>
            {message && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{message}</span>}
            {provider ? (
                <>
                    <Button
                        label={tx('Se connecter avec prof.parlemonde.org')}
                        variant="contained"
                        color="secondary"
                        onClick={() => authClient.signIn.social({ provider })}
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
                label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{tx('E-mail du professeur')}</span>}
                input={<Input id="email" name="email" type="text" color="secondary" isFullWidth required />}
            ></Field>
            <Field
                name="password"
                label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{tx('Mot de passe')}</span>}
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
            <Button label={tx('Se connecter')} variant="contained" color="secondary" type="submit" value="Submit"></Button>
            <Button marginTop="lg" as="a" href="/join" isFullWidth label={tx('Je suis un·e élève')} variant="outlined" color="secondary"></Button>
            <div className="text-center">
                <Link href="/reset-password" className="color-primary">
                    {tx('Mot de passe oublié ?')}
                </Link>
            </div>
            <div className="text-center" style={{ marginBottom: '2rem' }}>
                {tx('Nouveau sur Par Le Monde ?')} <Link href="/sign-up">{tx("S'inscrire")}</Link>
            </div>
            <div className="loader-wrapper">
                <FormLoader />
            </div>
        </Form>
    );
};
