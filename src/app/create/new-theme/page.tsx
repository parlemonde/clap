import { getTranslations } from 'next-intl/server';
import * as React from 'react';

import { Breadcrumbs } from '@frontend/components/layout/Breadcrumbs';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { BackButton } from '@frontend/components/navigation/BackButton';
import { Inverted } from '@frontend/components/ui/Inverted';

import { NewThemeForm } from './NewThemeForm';

export default async function NewThemePage() {
    const t = await getTranslations();

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
                {t.rich('new_theme_page.header.title', {
                    inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                })}
            </Title>
            <NewThemeForm />
        </Container>
    );
}
