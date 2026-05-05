'use client';

import { useLocale, useTranslations } from 'next-intl';
import React from 'react';

import { Field, Form } from '@frontend/components/layout/Form';
import { Select } from '@frontend/components/layout/Form/Select';
import type { LanguageOption } from '@server/database/schemas/languages';

interface LanguageSelectProps {
    languages: LanguageOption[];
    cookieName: string;
}

export const LanguageSelect = ({ languages, cookieName }: LanguageSelectProps) => {
    const t = useTranslations();
    const currentLocale = useLocale();

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
                            const appLanguageCookie = `${encodeURIComponent(cookieName)}=${encodeURIComponent(event.target.value)}; Path=/; Secure; SameSite=Strict; Max-Age=${24 * 60 * 60}`;
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
