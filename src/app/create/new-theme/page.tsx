import * as React from 'react';

import { NewThemeForm } from './NewThemeForm';
import { getTranslation } from 'src/actions/get-translation';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { BackButton } from 'src/components/navigation/BackButton';
import { Trans } from 'src/components/ui/Trans';

export default async function NewThemePage() {
    const { t } = await getTranslation();

    return (
        <Container paddingBottom="xl">
            <Breadcrumbs
                className="for-tablet-up-only"
                marginTop="sm"
                links={[{ href: '/', label: t('all_themes') }]}
                currentLabel={t('create_new_theme')}
            />
            <BackButton href="/" />
            <Title marginY="md">
                <Trans i18nKey="create_new_theme">Ajouter votre thème</Trans>
            </Title>
            <NewThemeForm />
        </Container>
    );
}
