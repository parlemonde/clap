import * as React from 'react';

import { VideoList } from './VideosList';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getProjects } from 'src/actions/projects/get-projects';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';

export default async function SettingsPage() {
    const projects = await getProjects();
    const user = await getCurrentUser();
    if (!user || user.role === 'student') {
        return null;
    }
    return (
        <Container paddingBottom="xl">
            <Title color="primary" variant="h1" marginY="md">
                <Trans i18nKey="my_videos_title">
                    Mes <Inverted>supers</Inverted> vidéos
                </Trans>
            </Title>
            <VideoList projects={projects} />
        </Container>
    );
}
