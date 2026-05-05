import { getTranslations } from 'next-intl/server';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Inverted } from '@frontend/components/ui/Inverted';
import { getCurrentUser } from '@server/auth/get-current-user';
import { getProjects } from '@server-actions/projects/get-projects';

import { VideoList } from './VideosList';

export default async function SettingsPage() {
    const [projects, user, t] = await Promise.all([getProjects(), getCurrentUser(), getTranslations()]);
    if (!user || user.role === 'student') {
        return null;
    }
    return (
        <Container paddingBottom="xl">
            <Title color="primary" variant="h1" marginY="md">
                {t.rich('my_videos_page.header.title', {
                    inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                })}
            </Title>
            <VideoList projects={projects} />
        </Container>
    );
}
