import * as React from 'react';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';

import { getLocales } from '@server-actions/get-locales';
import { getScenario } from '@server-actions/scenarios/get-scenario';
import { listThemes } from '@server-actions/themes/list-themes';

import { EditScenarioForm } from './EditScenarioForm';

export default async function AdminEditThemePage(props: { params: Promise<{ scenarioId: string }> }) {
    const params = await props.params;
    const [{ currentLocale }, scenario, themes] = await Promise.all([getLocales(), getScenario(Number(params.scenarioId) || 0), listThemes()]);

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
