import * as React from 'react';

import { NewScenarioForm } from './NewScenarioForm';
import { listThemes } from 'src/actions/themes/list-themes';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import type { ServerPageProps } from 'src/lib/page-props.types';

export default async function AdminNewScenarioPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const defaultThemeId = typeof searchParams.themeId === 'string' ? Number(searchParams.themeId) || 0 : undefined;
    const themes = await listThemes();

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
                <NewScenarioForm defaultThemeId={defaultThemeId} themes={themes} />
            </AdminTile>
        </Container>
    );
}
