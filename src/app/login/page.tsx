'use server';

import * as React from 'react';
import type { ServerPageProps } from 'src/lib/page-props.types';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { getTranslation } from '@server-actions/get-translation';

import { LoginForm } from './LoginForm';

const CLIENT_ID = process.env.CLIENT_ID || '';
const SSO_HOST = process.env.SSO_HOST || '';

export default async function LoginPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const stateQueryParam = typeof searchParams.state === 'string' ? searchParams.state : undefined;
    const codeQueryParam = typeof searchParams.code === 'string' ? searchParams.code : undefined;
    const { t } = await getTranslation();
    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t('login_page.header.title')}
            </Title>
            <LoginForm ssoHost={SSO_HOST} clientId={CLIENT_ID} stateQueryParam={stateQueryParam} codeQueryParam={codeQueryParam} />
        </Container>
    );
}
