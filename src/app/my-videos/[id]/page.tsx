import * as React from 'react';

import { ProjectForm } from './ProjectForm';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { getProject } from 'src/actions/projects/get-project';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Flex } from 'src/components/layout/Flex';
import { Text, Title } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';
import type { ServerPageProps } from 'src/lib/page-props.types';

export default async function EditProjectPage(props: ServerPageProps) {
    const params = await props.params;
    const user = await getCurrentUser();

    if (user?.role === 'student') {
        return null;
    }

    const projectId = Number(params.id);
    const project = await getProject(projectId);
    const { t } = await getTranslation();

    if (!project) {
        return (
            <Container paddingBottom="xl">
                <Flex isFullWidth flexDirection="column" alignItems="center">
                    <Text variant="p" marginTop="xl">
                        {t('video_page.not_found.text')}
                    </Text>
                    <Link href="/" passHref legacyBehavior>
                        <Button as="a" label={t('video_page.not_found_button.label')} color="primary" variant="contained" marginTop="md"></Button>
                    </Link>
                </Flex>
            </Container>
        );
    }

    return (
        <Container paddingBottom="xl">
            <div className="text-center" style={{ margin: '1rem 0' }}>
                <Title color="primary" variant="h1" style={{ display: 'inline' }}>
                    {t('video_page.header.title')}
                </Title>
                <Title color="inherit" variant="h1" style={{ display: 'inline' }} marginLeft="sm">
                    {project.name}
                </Title>
            </div>
            <Title color="inherit" variant="h2">
                {t('video_page.header.subtitle')}
            </Title>
            <ProjectForm project={project} />
        </Container>
    );
}
