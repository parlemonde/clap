import { redirect } from 'next/navigation';
import * as React from 'react';

import { LocalThemes } from './LocalThemes';
import Themes from './Themes';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { ThemeCard, ThemeCardPlaceholder } from 'src/components/create/ThemeCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';

export default async function Page() {
    const { t } = await getTranslation();
    const user = await getCurrentUser();

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
            <div className="themes-grid">
                <React.Suspense fallback={<ThemeCardPlaceholder />}>
                    <>
                        <ThemeCard href="/create/new-theme" name={t('new_theme_page.common.add_theme')} />
                        <Themes />
                        <LocalThemes />
                    </>
                </React.Suspense>
            </div>
        </Container>
    );
}
