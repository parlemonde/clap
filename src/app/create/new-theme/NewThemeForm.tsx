'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { createTheme } from 'src/actions/themes/create-theme';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import type { LocalTheme } from 'src/hooks/useLocalStorage/local-storage';

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
