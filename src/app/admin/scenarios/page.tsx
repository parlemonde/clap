'use server';

import { PlusCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { ScenariosTable } from './ScenariosTable';
import { ScenariosTablePlaceholder } from './ScenariosTablePlaceholder';
import { listScenarios } from 'src/actions/scenarios/list-scenarios';
import { listThemes } from 'src/actions/themes/list-themes';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';

const ScenariosTableWithData = async () => {
    const [themes, scenarios] = await Promise.all([listThemes(), listScenarios()]);

    return <ScenariosTable themes={themes} scenarios={scenarios} />;
};

export default async function AdminScenariosPage() {
    return (
        <Container>
            <Title marginTop="md">Scénarios</Title>
            <AdminTile
                marginY="md"
                title="Liste des scénarios par thème"
                actions={
                    <Link href="/admin/scenarios/new" passHref legacyBehavior>
                        <Button
                            label="Ajouter un scénario"
                            as="a"
                            variant="contained"
                            color="light-grey"
                            leftIcon={<PlusCircledIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
                        ></Button>
                    </Link>
                }
            >
                <React.Suspense fallback={<ScenariosTablePlaceholder />}>
                    <ScenariosTableWithData />
                </React.Suspense>
            </AdminTile>
        </Container>
    );
}
