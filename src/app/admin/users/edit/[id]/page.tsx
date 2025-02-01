import * as React from 'react';

import { EditUserForm } from './EditUserForm';
import { getUser } from 'src/actions/users/get-user';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import type { ServerPageProps } from 'src/lib/page-props.types';

export default async function AdminEditUserPage(props: ServerPageProps) {
    const params = await props.params;
    const user = await getUser(Number(params.id) || 0);

    if (!user) {
        return null;
    }

    return (
        <Container>
            <Breadcrumbs
                marginTop="md"
                links={[
                    {
                        href: '/admin/users',
                        label: <Title style={{ display: 'inline' }}>Utilisateurs</Title>,
                    },
                ]}
                currentLabel={<Title style={{ display: 'inline' }}>{user.name}</Title>}
            />
            <AdminTile marginY="md" title="Modifier l'utilisateur">
                <EditUserForm user={user} />
            </AdminTile>
        </Container>
    );
}
