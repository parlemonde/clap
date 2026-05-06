'use client';

import { useExtracted } from 'next-intl';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Title } from '@frontend/components/layout/Typography';
import { Link } from '@frontend/components/navigation/Link';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { requestPasswordReset } from '@server-actions/authentication/request-password-reset';

export default function ResetPasswordPage() {
    const t = useExtracted('reset-password');
    const commonT = useExtracted('common');

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
                    message: errorMsg,
                    type: 'error',
                });
            } else {
                sendToast({
                    message: t('Un lien pour réinitialiser le mot de passe de votre compte a été envoyé avec succès à votre adresse e-mail !'),
                    type: 'success',
                });
                currentTarget.reset();
            }
        } catch {
            sendToast({
                message: commonT('Une erreur est survenue...'),
                type: 'error',
            });
        }
        setIsLoading(false);
    };

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t('Réinitialiser le mot de passe')}
            </Title>
            <Form className="login-form" autoComplete="off" onSubmit={onSubmit}>
                <Field
                    name="email"
                    label={t('E-mail')}
                    input={<Input id="email" name="email" type="text" color="secondary" required isFullWidth autoComplete="off" />}
                ></Field>
                <Button label={t('Réinitialiser')} variant="contained" color="secondary" type="submit"></Button>
                <div className="text-center">
                    <Link href="/login">{t('Retour à la page de connexion')}</Link>
                </div>
                <Loader isLoading={isLoading} />
            </Form>
        </Container>
    );
}
