import { useRouter } from 'next/router';
import React from 'react';

import { useCreateThemeMutation } from 'src/api/themes/themes.post';
import { Breadcrumbs } from 'src/components/layout/Breadcrumbs';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { BackButton } from 'src/components/navigation/BackButton';
import { NextButton } from 'src/components/navigation/NextButton';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';

const NewThemePage = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const createThemeMutation = useCreateThemeMutation();

    const [themeName, setThemeName] = React.useState('');

    const onCreateTheme = () => {
        if (!themeName) {
            return;
        }
        createThemeMutation.mutate(
            {
                names: {
                    [currentLocale]: themeName,
                },
                order: 0,
                isDefault: false,
            },
            {
                onSuccess(newTheme) {
                    router.push(`/create/1-scenario?themeId=${newTheme.id}`);
                },
                onError(error) {
                    console.error(error);
                    sendToast({ message: t('unknown_error'), type: 'error' });
                },
            },
        );
    };

    return (
        <Container>
            <Breadcrumbs
                className="for-tablet-up-only"
                marginTop="sm"
                links={[{ href: '/create', label: t('all_themes') }]}
                currentLabel={t('create_new_theme')}
            />
            <BackButton href="/create" />
            <div
                style={{
                    maxWidth: '1000px',
                    margin: 'auto',
                    paddingBottom: '32px',
                }}
            >
                <Title marginY="md">
                    <Trans i18nKey="new_theme_title">
                        Créer votre <Inverted>thème</Inverted> :
                    </Trans>
                </Title>

                <Form onSubmit={onCreateTheme}>
                    <Field
                        name="theme_name"
                        label={
                            <Title color="inherit" variant="h2">
                                <Trans i18nKey="new_theme_title_label">
                                    Nom du thème<span style={{ color: 'red' }}>*</span> :
                                </Trans>
                            </Title>
                        }
                        input={
                            <Input
                                id="theme_name"
                                isFullWidth
                                marginTop="sm"
                                value={themeName}
                                onChange={(event) => {
                                    setThemeName(event.target.value.slice(0, 200));
                                }}
                                required
                                placeholder={t('new_theme_title_placeholder')}
                                style={{ marginTop: '8px' }}
                                color="secondary"
                                autoComplete="off"
                            />
                        }
                        helperText={`${themeName.length}/200`}
                    />
                    <NextButton backHref="/create" type="submit" />
                </Form>
            </div>
            <Loader isLoading={createThemeMutation.isLoading} />
        </Container>
    );
};

export default NewThemePage;
