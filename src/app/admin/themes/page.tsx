import { PlusCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { ThemesTable } from './ThemesTable';
import { ThemesTablePlaceholder } from './ThemesTablePlaceholder';
import { UserThemesTable } from './UserThemesTable';
import { listThemes, listUserThemes } from 'src/actions/themes/list-themes';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';

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
