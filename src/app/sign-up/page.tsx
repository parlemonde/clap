'use server';

import { redirect } from 'next/navigation';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import type { ServerPageProps } from '@lib/page-props.types';
import { getCurrentUser } from '@server/auth/get-current-user';
import { isInviteTokenValid } from '@server/auth/invite-token';
import { getTranslation } from '@server-actions/get-translation';

import { InviteTokenForm } from './InviteTokenForm';
import { SignUpForm } from './SignUpForm';

export default async function SignUpPage(props: ServerPageProps) {
    const currentUser = await getCurrentUser();
    const searchParams = await props.searchParams;
    const tokenQueryParam = typeof searchParams.inviteCode === 'string' ? searchParams.inviteCode : undefined;
    const { t } = await getTranslation();

    if (currentUser) {
        redirect('/');
    }

    const isCodeValid = tokenQueryParam && (await isInviteTokenValid(tokenQueryParam));

    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop="lg" marginBottom="md">
                {t('signup_page.header.title')}
            </Title>

            {isCodeValid ? <SignUpForm inviteCode={tokenQueryParam} /> : <InviteTokenForm initialCode={tokenQueryParam} />}
        </Container>
    );
}
