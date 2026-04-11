'use client';

import React from 'react';
import type { I18nKeys } from 'src/i18n/locales';

import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Title } from '@frontend/components/layout/Typography';
import { Link } from '@frontend/components/navigation/Link';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { useTranslation } from '@frontend/contexts/translationContext';
import { requestPasswordReset } from '@server-actions/authentication/request-password-reset';

export default function ResetPasswordPage() {
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = React.useState(false);
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentTarget = e.currentTarget;
        const formData = new FormData(currentTarget);
        const email = formData.get('email');
        if (typeof email !== 'string' || !email) {
            return;
        }
        setIsLoading(true);
        try {
            const errorMsg = await requestPasswordReset(email);
            if (errorMsg) {
                sendToast({
                    message: t(errorMsg as I18nKeys),
                    type: 'error',
                });
            } else {
                sendToast({
                    message: t('reset_password_page.toast_message.reset_success'),
                    type: 'success',
                });
                currentTarget.reset();
            }
        } catch {
            sendToast({
                message: t('common.errors.unknown'),
                type: 'error',
            });
        }
        setIsLoading(false);
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
