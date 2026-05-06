import { getExtracted } from 'next-intl/server';
import * as React from 'react';

import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { BackButton } from '@frontend/components/navigation/BackButton';
import { Inverted } from '@frontend/components/ui/Inverted';

import { NewThemeForm } from './NewThemeForm';

export default async function NewThemePage() {
    const t = await getExtracted('create.new-theme');
    const commonT = await getExtracted('common');

    return (
        <Container paddingBottom="xl">
            <Breadcrumbs
                className="for-tablet-up-only"
                marginTop="sm"
                links={[{ href: '/', label: commonT('Tout les thèmes') }]}
                currentLabel={t('Ajouter votre thème')}
            />
            <BackButton href="/" />
            <Title marginY="md">
                {t.rich('Créer votre <inverted>thème</inverted> :', {
                    inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                })}
            </Title>
            <NewThemeForm />
        </Container>
    );
}
