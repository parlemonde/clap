import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Breadcrumbs, Link as MuiLink, Typography, TextField } from '@mui/material';

import { useCreateThemeMutation } from 'src/api/themes/themes.post';
import { Loader } from 'src/components/layout/Loader';
import { BackButton } from 'src/components/navigation/BackButton';
import { NextButton } from 'src/components/navigation/NextButton';
import { Inverted } from 'src/components/ui/Inverted';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/i18n/useTranslation';

const NewThemePage = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const createThemeMutation = useCreateThemeMutation();

    const [themeName, setThemeName] = React.useState('');
    const [hasError, setHasError] = React.useState(false);

    const onCreateTheme = () => {
        if (!themeName) {
            setHasError(true);
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
                    enqueueSnackbar(t('unknown_error'), {
                        variant: 'error',
                    });
                },
            },
        );
    };

    return (
        <div>
            <Breadcrumbs sx={{ display: { xs: 'none', md: 'block' } }} separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                <Link href="/create" passHref>
                    <MuiLink color="inherit" href="/create" sx={{ textDecoration: 'none', ':hover': { textDecoration: 'underline' } }}>
                        {t('all_themes')}
                    </MuiLink>
                </Link>
                <Typography color="textPrimary">{t('create_new_theme')}</Typography>
            </Breadcrumbs>
            <BackButton href="/create" />

            <div
                style={{
                    maxWidth: '1000px',
                    margin: 'auto',
                    paddingBottom: '2rem',
                }}
            >
                <Typography color="primary" variant="h1" style={{ marginTop: '1rem' }}>
                    <Trans i18nKey="new_theme_title">
                        Créer votre <Inverted>thème</Inverted> :
                    </Trans>
                </Typography>
                <Typography color="inherit" variant="h2">
                    <Trans i18nKey="new_theme_title_label">
                        Nom du thème<span style={{ color: 'red' }}>*</span> :
                    </Trans>
                </Typography>
                <TextField
                    fullWidth
                    value={themeName}
                    onChange={(event) => {
                        setThemeName(event.target.value.slice(0, 200));
                        setHasError(false);
                    }}
                    error={hasError}
                    helperText={`${themeName.length}/200`}
                    FormHelperTextProps={{ style: { textAlign: 'right' } }}
                    className={hasError ? 'shake' : ''}
                    placeholder={t('new_theme_title_placeholder')}
                    style={{ marginTop: '0.5rem' }}
                    variant="outlined"
                    color="secondary"
                    autoComplete="off"
                />
                <NextButton backHref="/create" onNext={onCreateTheme} />
            </div>
            <Loader isLoading={createThemeMutation.isLoading} />
        </div>
    );
};

export default NewThemePage;
