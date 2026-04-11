'use client';

import React from 'react';

import { Field, Form } from '@frontend/components/layout/Form';
import { Select } from '@frontend/components/layout/Form/Select';
import { useTranslation } from '@frontend/contexts/translationContext';
import type { Language } from '@server/database/schemas/languages';

interface LanguageSelectProps {
    languages: Language[];
}

export const LanguageSelect = ({ languages }: LanguageSelectProps) => {
    const { t, currentLocale } = useTranslation();

    return (
        <Form preventSubmit>
            <Field
                name="language"
                label={t('settings_page.language_field.label')}
                input={
                    <Select
                        name="language"
                        id="language"
                        marginTop="xs"
                        isFullWidth
                        value={currentLocale}
                        onChange={(event) => {
                            const appLanguageCookie = `${encodeURIComponent('app-language')}=${encodeURIComponent(event.target.value)}; Path=/; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}`;
                            document.cookie = appLanguageCookie;
                            window.location.reload();
                        }}
                    >
                        {languages.map((l) => (
                            <option value={l.value} key={l.value}>
                                {l.label}
                            </option>
                        ))}
                    </Select>
                }
            ></Field>
        </Form>
    );
};
