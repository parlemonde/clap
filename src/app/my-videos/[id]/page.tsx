import { getExtracted } from 'next-intl/server';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Flex } from '@frontend/components/layout/Flex';
import { Text, Title } from '@frontend/components/layout/Typography';
import type { ServerPageProps } from '@lib/page-props.types';
import { getCurrentUser } from '@server/auth/get-current-user';
import { getProject } from '@server-actions/projects/get-project';

import { ProjectForm } from './ProjectForm';

export default async function EditProjectPage(props: ServerPageProps) {
    const params = await props.params;
    const user = await getCurrentUser();

    if (user?.role === 'student') {
        return null;
    }

    const projectId = Number(params.id);
    const project = await getProject(projectId);
    const tx = await getExtracted('my-videos.[id]');

    if (!project) {
        return (
            <Container paddingBottom="xl">
                <Flex isFullWidth flexDirection="column" alignItems="center">
                    <Text variant="p" marginTop="xl">
                        {tx("Cette vidéo n'existe pas !")}
                    </Text>
                    <Button as="a" href="/" label={tx("Retour à la page d'accueil")} color="primary" variant="contained" marginTop="md"></Button>
                </Flex>
            </Container>
        );
    }

    return (
        <Container paddingBottom="xl">
            <div className="text-center" style={{ margin: '1rem 0' }}>
                <Title color="primary" variant="h1" style={{ display: 'inline' }}>
                    {tx('Projet :')}
                </Title>
                <Title color="inherit" variant="h1" style={{ display: 'inline' }} marginLeft="sm">
                    {project.name}
                </Title>
            </div>
            <Title color="inherit" variant="h2">
                {tx('Détails du projets')}
            </Title>
            <ProjectForm project={project} />
        </Container>
    );
}
