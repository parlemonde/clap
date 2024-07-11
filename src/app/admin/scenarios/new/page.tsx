import * as React from 'react';

import { AdminTile } from 'src/components/admin/AdminTile';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';

export default function AdminNewScenarioPage() {
    return (
        <Container>
            <Breadcrumbs
                marginTop="md"
                links={[
                    {
                        href: '/admin/scenarios',
                        label: <Title style={{ display: 'inline' }}>Scénarios</Title>,
                    },
                ]}
                currentLabel={<Title style={{ display: 'inline' }}>Nouveau</Title>}
            />
            <AdminTile marginY="md" title="Ajouter un scénario">
                TODO
            </AdminTile>
        </Container>
    );
}
