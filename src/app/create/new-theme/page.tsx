import * as React from 'react';

import { NewThemeForm } from './NewThemeForm';
import { getTranslation } from 'src/actions/get-translation';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { BackButton } from 'src/components/navigation/BackButton';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';

export default async function NewThemePage() {
    const { t } = await getTranslation();

    return (
        <Container paddingBottom="xl">
            <Breadcrumbs
                className="for-tablet-up-only"
                marginTop="sm"
                links={[{ href: '/', label: t('common.filters.all_themes') }]}
                currentLabel={t('new_theme_page.common.add_theme')}
            />
            <BackButton href="/" />
            <Title marginY="md">
                <Trans i18nKey="new_theme_page.header.title">
                    Créer votre <Inverted>thème</Inverted> :
                </Trans>
            </Title>
            <NewThemeForm />
        </Container>
    );
}
