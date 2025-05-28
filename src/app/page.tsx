import { redirect } from 'next/navigation';
import * as React from 'react';

import { Themes } from './Themes';
import { getCurrentUser } from 'src/actions/get-current-user';
import { listThemes } from 'src/actions/themes/list-themes';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';

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
