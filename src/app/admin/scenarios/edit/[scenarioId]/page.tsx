import * as React from 'react';

import { EditScenarioForm } from './EditScenarioForm';
import { getLocales } from 'src/actions/get-locales';
import { getScenario } from 'src/actions/scenarios/get-scenario';
import { listThemes } from 'src/actions/themes/list-themes';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';

export default async function AdminEditThemePage({ params }: { params: { scenarioId: string } }) {
    const [{ currentLocale }, scenario, themes] = await Promise.all([getLocales(), getScenario(Number(params.scenarioId) ?? 0), listThemes()]);

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
                <EditScenarioForm themes={themes} scenario={scenario} />
            </AdminTile>
        </Container>
    );
}
