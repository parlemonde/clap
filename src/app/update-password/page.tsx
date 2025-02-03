'use server';

import React from 'react';

import { UpdatePasswordForm } from './UpdatePasswordForm';
import { getTranslation } from 'src/actions/get-translation';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import type { ServerPageProps } from 'src/lib/page-props.types';

export default async function UpdatePasswordPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const email = typeof searchParams.email === 'string' ? searchParams.email : '';
    const verifyToken = typeof searchParams['verify-token'] === 'string' ? searchParams['verify-token'] : '';

    const { t } = await getTranslation();

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t('forgot_password_title')}
            </Title>
            <UpdatePasswordForm email={email} verifyToken={verifyToken} />
        </Container>
    );
}
