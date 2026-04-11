'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { Trans } from '@frontend/components/ui/Trans';
import { useTranslation } from '@frontend/contexts/translationContext';
import { userContext } from '@frontend/contexts/userContext';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import type { LocalTheme } from '@frontend/hooks/useLocalStorage/local-storage';
import { createTheme } from '@server-actions/themes/create-theme';

export const NewThemeForm = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);
    const [themeName, setThemeName] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [localThemes, setLocalThemes] = useLocalStorage('themes', []);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (user) {
            setIsLoading(true);
            const newTheme = await createTheme(themeName);
            if (newTheme) {
                router.push(`/create/1-scenario?themeId=${newTheme.id}`);
            } else {
                sendToast({ message: t('common.errors.unknown'), type: 'error' });
            }
            setIsLoading(false);
        } else {
            const nextId = Math.max(0, ...localThemes.map((theme) => Number(theme.id.split('_')[1] || '0'))) + 1;
            const newTheme: LocalTheme = {
                id: `local_${nextId}`,
                name: themeName,
            };
            setLocalThemes([...localThemes, newTheme]);
            router.push(`/create/1-scenario?themeId=${newTheme.id}`);
        }
    };

    return (
        <>
            <Form onSubmit={onSubmit}>
                <Field
                    name="themeName"
                    label={
                        <Title color="inherit" variant="h2">
                            <Trans i18nKey="new_theme_page.name_field.label">
                                Nom du thème<span style={{ color: 'red' }}>*</span> :
                            </Trans>
                        </Title>
                    }
                    input={
                        <Input
                            id="themeName"
                            name="themeName"
                            isFullWidth
                            marginTop="sm"
                            value={themeName}
                            onChange={(event) => {
                                setThemeName(event.target.value.slice(0, 200));
                            }}
                            required
                            placeholder={t('new_theme_page.name_field.placeholder')}
                            style={{ marginTop: '8px' }}
                            color="secondary"
                            autoComplete="off"
                        />
                    }
                    helperText={`${themeName.length}/200`}
                />
                <NextButton backHref="/" type="submit" />
            </Form>
            <Loader isLoading={isLoading} />
        </>
    );
};
