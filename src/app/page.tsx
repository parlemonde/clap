import { redirect } from 'next/navigation';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Inverted } from '@frontend/components/ui/Inverted';
import { Trans } from '@frontend/components/ui/Trans';

import { getCurrentUser } from '@server-actions/get-current-user';
import { listThemes } from '@server-actions/themes/list-themes';

import { Themes } from './Themes';

export default async function Page() {
    const user = await getCurrentUser();
    const themes = await listThemes({ userId: user?.id });

    if (user?.role === 'student') {
        redirect('/create/3-storyboard');
    }

    return (
        <Container paddingBottom="xl">
            <Title marginY="md">
                <Trans i18nKey="home_page.header.title">
                    Sur quel <Inverted>thème</Inverted> sera votre vidéo ?
                </Trans>
            </Title>
            <Themes themes={themes} />
        </Container>
    );
}
