import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';

import { LanguagesTable } from './LanguagesTable';

export default async function AdminLanguagesPage() {
    const availableLanguages = await db.select({ value: languages.value, label: languages.label }).from(languages);

    return (
        <Container>
            <Title marginTop="md">Langues</Title>
            <LanguagesTable languages={availableLanguages} />
        </Container>
    );
}
