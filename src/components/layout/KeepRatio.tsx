import React from 'react';

import type { SxProps, Theme } from '@mui/system';
import { Box } from '@mui/system';

interface KeepRatioProps {
    ratio: number;
    minHeight?: string | number;
    className?: string;
    sx?: SxProps<Theme>;
}

export const KeepRatio = ({ minHeight = 0, ratio, className = '', sx = {}, children }: React.PropsWithChildren<KeepRatioProps>) => {
    return (
        <div style={{ width: '100%', paddingBottom: `${ratio * 100}%`, minHeight, position: 'relative' }}>
            <Box className={className} sx={{ ...sx, position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
                {children}
            </Box>
        </div>
    );
};
