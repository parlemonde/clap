import React, { useEffect, useRef, useState } from 'react';

import CardMedia from '@mui/material/CardMedia';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { useTranslation } from 'src/i18n/useTranslation';

const colors = ['rgb(96, 105, 243)', 'rgb(213, 89, 84)', 'rgb(250, 225, 108)', 'rgb(62, 65, 87)', 'rgb(215, 213, 209)', 'rgb(162, 220, 174)'];

interface ThemeCardProps {
    id?: string | number | null;
    names?: { [key: string]: string };
    image?: {
        path: string;
    } | null;
    onClick?(path: string): void;
}

export const ThemeCard: React.FunctionComponent<ThemeCardProps> = ({ id, names, image, onClick = () => {} }: ThemeCardProps) => {
    const img = useRef<HTMLImageElement | null>(null);
    const { currentLocale, t } = useTranslation();
    const [imgHasError, setImgHasError] = useState(false);

    const themeName = names === undefined ? t('create_new_theme') : names[currentLocale] || names.fr;
    const themeUrl = id !== undefined ? `/create/1-scenario-choice?themeId=${id}` : '/create/new-theme';

    useEffect(() => {
        if (image !== undefined && image !== null) {
            const i = new Image();
            i.onload = () => {
                if (img && img.current) {
                    img.current.src = i.src;
                }
            };
            i.onerror = () => {
                setImgHasError(true);
            };
            i.src = image.path;
        }
    }, [image]);

    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault();
        onClick(themeUrl);
    };

    return (
        <a className="theme-card-button" href={themeUrl} onClick={handleClick}>
            <Paper className="theme-card-paper">
                {id !== undefined && image && !imgHasError ? (
                    <CardMedia ref={img} component="img" alt={`picture of ${themeName} theme`} image="/classe_default.png" />
                ) : (
                    <div
                        className="theme-card-default"
                        style={{
                            backgroundColor: colors[(typeof id === 'string' ? parseInt(id.split('_')[1], 10) || 0 : id || 0) % 6],
                        }}
                    />
                )}
            </Paper>
            <Typography className="theme-card-title">{themeName}</Typography>
        </a>
    );
};
