'use server';

import { PlusCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { listScenarios, listUserScenarios } from '@server-actions/scenarios/list-scenarios';
import { listThemes } from '@server-actions/themes/list-themes';

import { ScenariosTable } from './ScenariosTable';
import { ScenariosTablePlaceholder } from './ScenariosTablePlaceholder';
import { UserScenariosTable } from './UserScenariosTable';

const ScenariosTableWithData = async () => {
    const [themes, scenarios] = await Promise.all([listThemes(), listScenarios()]);

    return <ScenariosTable themes={themes} scenarios={scenarios} />;
};

const UserScenariosTableWithData = async () => {
    const [themes, scenarios] = await Promise.all([listThemes(), listUserScenarios()]);

    return <UserScenariosTable themes={themes} scenarios={scenarios} />;
};

export default async function AdminScenariosPage() {
    return (
        <Container>
            <Title marginTop="md">Scénarios</Title>
            <AdminTile
                marginY="md"
                title="Liste des scénarios par thème"
                actions={
                    <Button
                        as="a"
                        label="Ajouter un scénario"
                        href="/admin/scenarios/new"
                        variant="contained"
                        color="light-grey"
                        leftIcon={<PlusCircledIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
                    ></Button>
                }
            >
                <React.Suspense fallback={<ScenariosTablePlaceholder />}>
                    <ScenariosTableWithData />
                </React.Suspense>
            </AdminTile>

            <React.Suspense>
                <UserScenariosTableWithData />
            </React.Suspense>
        </Container>
    );
}
