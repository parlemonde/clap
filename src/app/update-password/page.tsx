'use server';

import React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import type { ServerPageProps } from '@lib/page-props.types';
import { getTranslation } from '@server-actions/get-translation';

import { UpdatePasswordForm } from './UpdatePasswordForm';

export default async function UpdatePasswordPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const verifyToken = typeof searchParams['verify-token'] === 'string' ? searchParams['verify-token'] : '';

    const { t } = await getTranslation();

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t('update_password_page.header.title')}
            </Title>
            <UpdatePasswordForm verifyToken={verifyToken} />
        </Container>
    );
}
