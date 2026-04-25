import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { getUsers } from '@server-actions/users/get-users';

import { UsersTable } from './UsersTable';
import { UsersTablePlaceholder } from './UsersTablePlaceholder';

const UsersTableWithData = async () => {
    const users = await getUsers();
    return <UsersTable users={users} />;
};

export default async function AdminUsersPage() {
    return (
        <Container>
            <Title marginTop="md">Utilisateurs</Title>
            <React.Suspense fallback={<UsersTablePlaceholder />}>
                <UsersTableWithData />
            </React.Suspense>
        </Container>
    );
}
