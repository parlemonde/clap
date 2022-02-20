import React from 'react';

import Box from '@mui/material/Box';
import type { Theme as MaterialTheme } from '@mui/material/styles';

const styles = {
    primary: {
        backgroundColor: (theme: MaterialTheme) => theme.palette.primary.main,
        color: (theme: MaterialTheme) => theme.palette.primary.contrastText,
    },
    secondary: {
        backgroundColor: (theme: MaterialTheme) => theme.palette.secondary.main,
        color: (theme: MaterialTheme) => theme.palette.secondary.contrastText,
    },
};

interface InvertedProps {
    children: React.ReactNode;
    round?: boolean;
    color?: keyof typeof styles;
}

export const Inverted: React.FunctionComponent<InvertedProps> = ({ children, round = false, color = 'primary' }: InvertedProps) => {
    return (
        <Box
            component="span"
            sx={{
                padding: '0 0.1rem',
                ...styles[color],
                ...(round ? { borderRadius: '1rem', display: 'inline-block', height: '2rem', textAlign: 'center', width: '2rem' } : {}),
            }}
        >
            {children}
        </Box>
    );
};
