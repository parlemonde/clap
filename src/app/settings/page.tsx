import * as React from 'react';
import { getTranslation } from 'src/actions/get-translation';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { db } from 'src/database';

import { LanguageSelect } from './LanguageSelect';

export default async function SettingsPage() {
    const { t } = await getTranslation();
    const languages = await db.query.languages.findMany();

    return (
        <Container paddingBottom="xl">
            <Title marginY="md">{t('settings_page.header.title')}</Title>
            <Title color="inherit" variant="h2" marginTop="sm" marginBottom="md" style={{ width: '100%', textAlign: 'left' }}>
                {t('settings_page.language_header.title')}
            </Title>
            <LanguageSelect languages={languages} />
        </Container>
    );
}
