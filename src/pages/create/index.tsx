import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Box, Typography, Skeleton } from '@mui/material';

import { useThemes } from 'src/api/themes/themes.list';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';

const COLORS = ['rgb(96, 105, 243)', 'rgb(213, 89, 84)', 'rgb(250, 225, 108)', 'rgb(62, 65, 87)', 'rgb(215, 213, 209)', 'rgb(162, 220, 174)'];

type ThemeCardProps = {
    href: string;
    name: string;
    imageUrl?: string | null;
    index?: number;
};
const ThemeCard = ({ href, name, imageUrl, index = 0 }: ThemeCardProps) => {
    const [showBackgroundColor, setShowBackgroundColor] = React.useState(true);
    return (
        <Link href={href} passHref>
            <a className="theme-card">
                <KeepRatio ratio={0.7}>
                    <div
                        style={{ width: '100%', height: '100%', backgroundColor: showBackgroundColor ? COLORS[index % COLORS.length] : 'unset' }}
                        className="theme-card-image"
                    >
                        {imageUrl && (
                            <Image
                                onLoadingComplete={() => {
                                    setShowBackgroundColor(false);
                                }}
                                layout="fill"
                                src={imageUrl}
                                unoptimized
                            />
                        )}
                    </div>
                </KeepRatio>
                <Typography component="span">{name}</Typography>
            </a>
        </Link>
    );
};

const ThemeCardSkeleton = () => (
    <div>
        <KeepRatio ratio={0.7}>
            <Skeleton variant="rectangular" width="100%" height="100%" className="theme-card-image" />
            <Typography component="span">
                <Skeleton variant="text" width="80%" sx={{ margin: '0 auto' }} />
            </Typography>
        </KeepRatio>
    </div>
);

const CreatePage: React.FunctionComponent = () => {
    const { t, currentLocale } = useTranslation();
    const { themes, isLoading } = useThemes({ isDefault: true, self: true });

    return (
        <div>
            <Typography color="primary" variant="h1">
                <Trans i18nKey="create_theme_title">
                    Sur quel <Inverted>thème</Inverted> sera votre vidéo ?
                </Trans>
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { md: 'repeat(3, 1fr)', xs: 'repeat(2, 1fr)' },
                    gridAutoRows: 'auto',
                    gap: '16px',
                    maxWidth: { md: '800px', xs: '600px' },
                    margin: '2rem auto',
                }}
            >
                <ThemeCard href="/create/new-theme" name={t('create_new_theme')} />
                {isLoading ? (
                    <ThemeCardSkeleton />
                ) : (
                    themes.map((theme, index) => (
                        <ThemeCard
                            key={theme.id}
                            index={index + 1}
                            href={`/create/1-scenario?themeId=${theme.id}`}
                            imageUrl={theme.imageUrl}
                            name={theme.names[currentLocale] || theme.names.fr}
                        />
                    ))
                )}
            </Box>
        </div>
    );
};

export default CreatePage;
