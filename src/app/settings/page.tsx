import * as React from 'react';

import { getTranslation } from 'src/actions/get-translation';
import { Container } from 'src/components/layout/Container';
import { Field, Form } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Title } from 'src/components/layout/Typography';

export default async function SettingsPage() {
    const { t, currentLocale } = await getTranslation();
    const languages = [
        {
            label: 'Français',
            value: 'fr',
        },
        {
            label: 'English',
            value: 'en',
        },
    ];

    return (
        <Container paddingBottom="xl">
            <Title marginY="md">{t('settings')}</Title>
            <Title color="inherit" variant="h2" marginTop="sm" marginBottom="md" style={{ width: '100%', textAlign: 'left' }}>
                {t('change_language')}
            </Title>
            <Form preventSubmit>
                <Field
                    name="language"
                    label={t('language')}
                    input={
                        <Select name="language" id="language" marginTop="xs" isFullWidth value={currentLocale}>
                            {languages.map((l) => (
                                <option value={l.value} key={l.value}>
                                    {l.label}
                                </option>
                            ))}
                        </Select>
                    }
                ></Field>
            </Form>
        </Container>
    );
}
