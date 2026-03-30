import { PlusCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Link } from '@frontend/components/navigation/Link';

import { listThemes, listUserThemes } from '@server-actions/themes/list-themes';

import { ThemesTable } from './ThemesTable';
import { ThemesTablePlaceholder } from './ThemesTablePlaceholder';
import { UserThemesTable } from './UserThemesTable';

const ThemesTableWithData = async () => {
    const defaultThemes = await listThemes();

    return <ThemesTable defaultThemes={defaultThemes} />;
};

const UserThemesTableWithData = async () => {
    const userThemes = await listUserThemes();

    return <UserThemesTable userThemes={userThemes} />;
};

export default async function AdminThemesPage() {
    return (
        <Container>
            <Title marginTop="md">Thèmes</Title>
            <AdminTile
                marginY="md"
                title="Liste des thèmes"
                actions={
                    <Link href="/admin/themes/new" passHref legacyBehavior>
                        <Button
                            label="Ajouter un thème"
                            as="a"
                            variant="contained"
                            color="light-grey"
                            leftIcon={<PlusCircledIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
                        ></Button>
                    </Link>
                }
            >
                <React.Suspense fallback={<ThemesTablePlaceholder />}>
                    <ThemesTableWithData />
                </React.Suspense>
            </AdminTile>

            <React.Suspense>
                <UserThemesTableWithData />
            </React.Suspense>
        </Container>
    );
}
