'use client';

import { useExtracted, useLocale } from 'next-intl';
import React from 'react';

import { Field, Form } from '@frontend/components/layout/Form';
import { Select } from '@frontend/components/layout/Form/Select';
import type { LanguageOption } from '@server/database/schemas/languages';

interface LanguageSelectProps {
    languages: LanguageOption[];
    cookieName: string;
}

export const LanguageSelect = ({ languages, cookieName }: LanguageSelectProps) => {
    const tx = useExtracted('settings.LanguageSelect');
    const currentLocale = useLocale();

    return (
        <Form preventSubmit>
            <Field
                name="language"
                label={tx('Langue')}
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
