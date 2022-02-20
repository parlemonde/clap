import { useRouter } from 'next/router';
import React from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { useTranslation } from 'src/i18n/useTranslation';
import { ProjectServiceContext } from 'src/services/useProject';

export const ThemeLink: React.FunctionComponent = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project } = React.useContext(ProjectServiceContext);

    const handleHome = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push('/create');
    };

    const themeName = project.theme?.names[currentLocale] || project.theme?.names['fr'] || '';

    return (
        <Breadcrumbs sx={{ display: { xs: 'none', md: 'block' } }} separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }} href="/create" onClick={handleHome}>
                {t('all_themes')}
            </Link>
            <Typography color="textPrimary">{themeName}</Typography>
        </Breadcrumbs>
    );
};
