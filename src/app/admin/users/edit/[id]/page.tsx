import * as React from 'react';
import type { ServerPageProps } from 'src/lib/page-props.types';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';

import { getUser } from '@server-actions/users/get-user';

import { EditUserForm } from './EditUserForm';

export default async function AdminEditUserPage(props: ServerPageProps) {
    const params = await props.params;
    const user = await getUser(params.id);

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
