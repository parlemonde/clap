import Link from 'next/link';
import React from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as MaterialLink, Breadcrumbs, Typography, Skeleton } from '@mui/material';

import { useTranslation } from 'src/i18n/useTranslation';
import type { Theme } from 'types/models/theme.type';

type ThemeBreadcrumbsProps = {
    theme?: Theme;
    isLoading?: boolean;
};
export const ThemeBreadcrumbs = ({ theme, isLoading }: ThemeBreadcrumbsProps) => {
    const { t, currentLocale } = useTranslation();

    return (
        <Breadcrumbs sx={{ display: { xs: 'none', md: 'block' } }} separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link passHref href="/create">
                <MaterialLink color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    {t('all_themes')}
                </MaterialLink>
            </Link>
            <Typography color="textPrimary">
                {isLoading ? (
                    <Skeleton variant="text" width="100px" animation="wave" />
                ) : theme ? (
                    theme.names[currentLocale] || theme.names.fr || ''
                ) : (
                    ''
                )}
            </Typography>
        </Breadcrumbs>
    );
};
