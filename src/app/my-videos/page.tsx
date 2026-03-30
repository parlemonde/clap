import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Inverted } from '@frontend/components/ui/Inverted';
import { Trans } from '@frontend/components/ui/Trans';

import { getCurrentUser } from '@server/auth/get-current-user';

import { getProjects } from '@server-actions/projects/get-projects';

import { VideoList } from './VideosList';

export default async function SettingsPage() {
    const projects = await getProjects();
    const user = await getCurrentUser();
    if (!user || user.role === 'student') {
        return null;
    }
    return (
        <Container paddingBottom="xl">
            <Title color="primary" variant="h1" marginY="md">
                <Trans i18nKey="my_videos_page.header.title">
                    Mes <Inverted>supers</Inverted> vidéos
                </Trans>
            </Title>
            <VideoList projects={projects} />
        </Container>
    );
}
