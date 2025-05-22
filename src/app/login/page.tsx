'use server';

import * as React from 'react';

import { LoginForm } from './LoginForm';
import { getTranslation } from 'src/actions/get-translation';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import type { ServerPageProps } from 'src/lib/page-props.types';

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
