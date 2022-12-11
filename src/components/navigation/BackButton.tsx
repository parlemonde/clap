import Link from 'next/link';
import React from 'react';

import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { Button } from '@mui/material';

import { useTranslation } from 'src/i18n/useTranslation';

type BackButtonProps = {
    href: string;
    label?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
};

export const BackButton = ({ href, label = 'back', style, onClick = () => {} }: BackButtonProps) => {
    const { t } = useTranslation();

    return (
        <Link href={href} passHref>
            <Button
                component="a"
                sx={{ display: { xs: 'inline-flex', md: 'none' }, margin: style && style.margin ? undefined : '1rem 0 0 0' }}
                style={style}
                size="medium"
                onClick={onClick}
            >
                <KeyboardArrowLeft />
                {t(label)}
            </Button>
        </Link>
    );
};
