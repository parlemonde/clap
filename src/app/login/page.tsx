'use server';

import { getTranslations } from 'next-intl/server';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { PARLEMONDE_SSO_PROVIDER_ID } from '@server/auth/parlemonde-sso-plugin';

import { LoginForm } from './LoginForm';

export default async function LoginPage() {
    const ssoProvider = PARLEMONDE_SSO_PROVIDER_ID;
    const t = await getTranslations();

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t('login_page.header.title')}
            </Title>
            <LoginForm provider={ssoProvider} />
        </Container>
    );
}
