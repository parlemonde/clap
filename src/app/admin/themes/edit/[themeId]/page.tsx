import * as React from 'react';

import { EditThemeForm } from './EditThemeForm';
import { getLocales } from 'src/actions/get-locales';
import { getTheme } from 'src/actions/themes/get-theme';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';

export default async function AdminEditThemePage({ params }: { params: { themeId: string } }) {
    const theme = await getTheme(Number(params.themeId) ?? 0);
    const { currentLocale } = await getLocales();

    if (!theme) {
        return null;
    }

    return (
        <Container>
            <Breadcrumbs
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
