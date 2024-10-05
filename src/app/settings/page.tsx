import * as React from 'react';

import { LanguageSelect } from './LanguageSelect';
import { getTranslation } from 'src/actions/get-translation';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { db } from 'src/database';

export default async function SettingsPage() {
    const { t } = await getTranslation();
    const languages = await db.query.languages.findMany();

    return (
        <Container paddingBottom="xl">
            <Title marginY="md">{t('settings')}</Title>
            <Title color="inherit" variant="h2" marginTop="sm" marginBottom="md" style={{ width: '100%', textAlign: 'left' }}>
                {t('change_language')}
            </Title>
            <LanguageSelect languages={languages} />
        </Container>
    );
}
