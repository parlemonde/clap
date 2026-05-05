import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Inverted } from '@frontend/components/ui/Inverted';
import { getCurrentUser } from '@server/auth/get-current-user';
import { listThemes } from '@server-actions/themes/list-themes';

import { Themes } from './Themes';

export default async function Page() {
    const user = await getCurrentUser();
    const [themes, t] = await Promise.all([listThemes({ userId: user?.id }), getTranslations()]);

    if (user?.role === 'student') {
        redirect('/create/3-storyboard');
    }

    return (
        <Container paddingBottom="xl">
            <Title marginY="md">
                {t.rich('home_page.header.title', {
                    inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                })}
            </Title>
            <Themes themes={themes} />
        </Container>
    );
}
