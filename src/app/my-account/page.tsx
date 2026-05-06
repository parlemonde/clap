import { getExtracted } from 'next-intl/server';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Divider } from '@frontend/components/layout/Divider';
import { Title } from '@frontend/components/layout/Typography';
import { getCurrentUser } from '@server/auth/get-current-user';
import { isSSOUser } from '@server/auth/is-sso-user';

import { DeleteAccountButton } from './DeleteAccountButton';
import { LogoutForm } from './LogoutForm';
import { UpdateEmailForm } from './UpdateEmailForm';
import { UpdateNameForm } from './UpdateNameForm';
import { UpdatePasswordButton } from './UpdatePasswordButton';

export default async function AccountPage() {
    const tx = await getExtracted('my-account');
    const user = await getCurrentUser();

    if (!user || user.role === 'student') {
        return null;
    }

    const isSso = await isSSOUser(user.id);

    return (
        <Container>
            <div className="text-center">
                <Title color="primary" variant="h1" marginY="md">
                    {tx('Mon compte')}
                </Title>
            </div>
            <Title color="inherit" variant="h2">
                {tx('Mes identifiants')}
            </Title>
            <div style={{ marginTop: '0.5rem' }}>
                <label>
                    <strong>{tx('Nom du professeur')} : </strong>
                </label>
                {user.name} - <UpdateNameForm user={user} />
            </div>
            <div style={{ marginTop: '4px' }}>
                <label>
                    <strong>{tx('E-mail du professeur')} : </strong>
                </label>
                {user.email}
                {!isSso && (
                    <>
                        {' - '}
                        <UpdateEmailForm user={user} />
                    </>
                )}
            </div>
            {!isSso && <UpdatePasswordButton />}
            <Divider marginY="lg" />
            <Title color="inherit" variant="h2">
                {tx('Se déconnecter')}
            </Title>
            <LogoutForm />
            <Divider marginY="lg" />
            <Title color="inherit" variant="h2">
                {tx('Supprimer mon compte')}
            </Title>
            <DeleteAccountButton />
        </Container>
    );
}
