import React from 'react';

import { useThemes } from 'src/api/themes/themes.list';
import { ThemeCard } from 'src/components/create/ThemeCard';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';

const CreatePage = () => {
    const { t, currentLocale } = useTranslation();
    const { themes, isLoading } = useThemes({ isDefault: true, self: true });

    return (
        <Container>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '32px' }}>
                <Title marginY="md">
                    <Trans i18nKey="create_theme_title">
                        Sur quel <Inverted>thème</Inverted> sera votre vidéo ?
                    </Trans>
                </Title>
                <div className="themes-grid">
                    <ThemeCard index={0} href="/create/new-theme" name={t('create_new_theme')} />
                    {isLoading ? (
                        <ThemeCard.Placeholder />
                    ) : (
                        themes.map((theme, index) => (
                            <ThemeCard
                                key={theme.id}
                                index={index + 1}
                                imageUrl={theme.imageUrl}
                                name={theme.names[currentLocale] || theme.names.fr}
                                href={`/create/1-scenario?themeId=${theme.id}`}
                            />
                        ))
                    )}
                </div>
            </div>
        </Container>
    );
};

export default CreatePage;
