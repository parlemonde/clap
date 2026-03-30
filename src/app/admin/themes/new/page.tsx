import * as React from 'react';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';

import { NewThemeForm } from './NewThemeForm';

export default function AdminNewThemePage() {
    return (
        <Container>
            <Breadcrumbs
                marginTop="md"
                links={[
                    {
                        href: '/admin/themes',
                        label: <Title style={{ display: 'inline' }}>Thèmes</Title>,
                    },
                ]}
                currentLabel={<Title style={{ display: 'inline' }}>Nouveau</Title>}
            />
            <AdminTile marginY="md" title="Ajouter un thème">
                <NewThemeForm />
            </AdminTile>
        </Container>
    );
}
