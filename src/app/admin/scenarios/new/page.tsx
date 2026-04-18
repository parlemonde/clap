import * as React from 'react';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import type { ServerPageProps } from '@lib/page-props.types';
import { listThemes } from '@server-actions/themes/list-themes';

import { NewScenarioForm } from './NewScenarioForm';

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
