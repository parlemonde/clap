import { getExtracted } from 'next-intl/server';
import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { APP_LANGUAGE_COOKIE_NAME } from '@server/i18n/constants';

import { LanguageSelect } from './LanguageSelect';

export default async function SettingsPage() {
    const t = await getExtracted('settings');
    const availableLanguages = await db.select({ value: languages.value, label: languages.label }).from(languages);

    return (
        <Container paddingBottom="xl">
            <Title marginY="md">{t('Réglages')}</Title>
            <Title color="inherit" variant="h2" marginTop="sm" marginBottom="md" style={{ width: '100%', textAlign: 'left' }}>
                {t("Changer la langue de l'application :")}
            </Title>
            <LanguageSelect languages={availableLanguages} cookieName={APP_LANGUAGE_COOKIE_NAME} />
        </Container>
    );
}
