import Link from 'next/link';
import React from 'react';

import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';
import { useTranslation } from 'src/i18n/useTranslation';
import { httpRequest } from 'src/utils/http-request';

const errorMessages = {
    0: 'login_unknown_error',
    1: 'login_email_error',
};

const ResetPassword: React.FunctionComponent = () => {
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
        const response = await httpRequest({
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

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop="lg" marginBottom="md">
                {t('forgot_password_title')}
            </Title>
            <Form className="login-form" autoComplete="off" onSubmit={submit}>
                {errorCode === 0 && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{t(errorMessages[0])}</span>}
                {successMsg.length > 0 && (
                    <span style={{ display: 'block' }} color="color-primary">
                        {t(successMsg)}
                    </span>
                )}
                <Field
                    name="username"
                    label={t('forgot_password_email')}
                    input={
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            color="secondary"
                            value={email}
                            required
                            onChange={handleUserNameInputChange}
                            isFullWidth
                            hasError={errorCode === 1}
                        />
                    }
                    helperText={errorCode === 1 ? t(errorMessages[1]) : ''}
                    helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                ></Field>
                <Button label={t('forgot_password_button')} variant="contained" color="secondary" type="submit"></Button>
                <div className="text-center">
                    <Link href="/login">{t('login_connect')}</Link>
                </div>
            </Form>
            <Loader isLoading={loading} />
        </Container>
    );
};

export default ResetPassword;
