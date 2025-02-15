import * as React from 'react';

import { UsersTable } from './UsersTable';
import { UsersTablePlaceholder } from './UsersTablePlaceholder';
import { getUsers } from 'src/actions/users/get-users';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';

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
