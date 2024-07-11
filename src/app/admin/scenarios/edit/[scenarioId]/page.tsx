import * as React from 'react';

import { getLocales } from 'src/actions/get-locales';
import { getScenario } from 'src/actions/scenarios/get-scenario';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';

export default async function AdminEditThemePage({ params }: { params: { scenarioId: string } }) {
    const scenario = await getScenario(Number(params.scenarioId) ?? 0);
    const { currentLocale } = await getLocales();

    if (!scenario) {
        return null;
    }

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
                currentLabel={<Title style={{ display: 'inline' }}>{scenario.names[currentLocale]}</Title>}
            />
            <AdminTile marginY="md" title="Modifier le scénario">
                TODO
            </AdminTile>
        </Container>
    );
}
