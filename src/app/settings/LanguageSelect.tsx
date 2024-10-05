'use client';

import React from 'react';

import { Field, Form } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { useTranslation } from 'src/contexts/translationContext';
import type { Language } from 'src/database/schemas/languages';

interface LanguageSelectProps {
    languages: Language[];
}

export const LanguageSelect = ({ languages }: LanguageSelectProps) => {
    const { t, currentLocale } = useTranslation();

    return (
        <Form preventSubmit>
            <Field
                name="language"
                label={t('language')}
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
