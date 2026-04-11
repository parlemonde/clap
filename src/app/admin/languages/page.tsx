import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { db } from '@server/database';

import { LanguagesTable } from './LanguagesTable';

export default async function AdminLanguagesPage() {
    const languages = await db.query.languages.findMany();

    return (
        <Container>
            <Title marginTop="md">Langues</Title>
            <LanguagesTable languages={languages} />
        </Container>
    );
}
