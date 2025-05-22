'use client';

import React from 'react';

import { resetPassword } from 'src/actions/authentication/reset-password';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/contexts/translationContext';

export default function ResetPasswordPage() {
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = React.useState(false);
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await resetPassword(formData);
        setIsLoading(false);
        sendToast({
            message: t('reset_password_page.toast_message.reset_success'),
            type: 'success',
        });
    };

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t('reset_password_page.header.title')}
            </Title>
            <Form className="login-form" autoComplete="off" onSubmit={onSubmit}>
                <Field
                    name="email"
                    label={t('reset_password_page.email_field.label')}
                    input={<Input id="email" name="email" type="text" color="secondary" required isFullWidth autoComplete="off" />}
                ></Field>
                <Button label={t('reset_password_page.submit_button.label')} variant="contained" color="secondary" type="submit"></Button>
                <div className="text-center">
                    <Link href="/login">{t('reset_password_page.login_link.label')}</Link>
                </div>
                <Loader isLoading={isLoading} />
            </Form>
        </Container>
    );
}
