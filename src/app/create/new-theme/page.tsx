import * as React from 'react';

import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { BackButton } from '@frontend/components/navigation/BackButton';
import { Inverted } from '@frontend/components/ui/Inverted';
import { Trans } from '@frontend/components/ui/Trans';
import { getTranslation } from '@server-actions/get-translation';

import { NewThemeForm } from './NewThemeForm';

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
