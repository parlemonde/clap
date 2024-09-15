import * as React from 'react';

import { LanguagesTable } from './LanguagesTable';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { db } from 'src/database';

export default async function AdminLanguagesPage() {
    const languages = await db.query.languages.findMany();

    return (
        <Container>
            <Title marginTop="md">Langues</Title>
            <LanguagesTable languages={languages} />
        </Container>
    );
}
