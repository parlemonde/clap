import * as React from 'react';
import type { ServerPageProps } from 'src/lib/page-props.types';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';

import { getLocales } from '@server-actions/get-locales';
import { getTheme } from '@server-actions/themes/get-theme';

import { EditThemeForm } from './EditThemeForm';

export default async function AdminEditThemePage(props: ServerPageProps) {
    const params = await props.params;
    const theme = await getTheme(Number(params.themeId) || 0);
    const { currentLocale } = await getLocales();

    if (!theme) {
        return null;
    }

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
                currentLabel={<Title style={{ display: 'inline' }}>{theme.names[currentLocale]}</Title>}
            />
            <AdminTile marginY="md" title="Modifier le thème">
                <EditThemeForm theme={theme} />
            </AdminTile>
        </Container>
    );
}
