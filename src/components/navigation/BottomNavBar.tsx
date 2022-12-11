import { useRouter } from 'next/router';
import React from 'react';

import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import type { Theme as MaterialTheme } from '@mui/material/styles';

import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { getTabs } from 'src/utils/tabs';
import { UserType } from 'types/models/user.type';

const BottomNavigationActionSx = {
    fill: '#808080',
    color: '#808080',
    '&.Mui-selected': {
        fill: (theme: MaterialTheme) => theme.palette.secondary.main,
        color: (theme: MaterialTheme) => theme.palette.secondary.main,
    },
};

export const BottomNavBar = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);
    const currentPath = React.useMemo(() => {
        return router.pathname.split('/')[1];
    }, [router]);

    const isOnAdmin = currentPath === '/admin';
    const tabs = React.useMemo(() => getTabs(user !== null, user !== null && user.type >= UserType.ADMIN, isOnAdmin), [user, isOnAdmin]);

    const selectedValue = React.useMemo(() => {
        return tabs.reduce<number | undefined>((i1, tab, i2) => (tab.path.split('/')[1] === currentPath ? i2 : i1), undefined);
    }, [currentPath, tabs]);

    if (isOnAdmin) {
        return null;
    }

    return (
        <Box component="footer" sx={{ display: { md: 'none', xs: 'block' } }}>
            <Box sx={{ pb: 7, mb: '1px' }}></Box>
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderRadius: 0,
                    backgroundColor: '#fafafa',
                    borderTop: '1px solid rgba(128, 128, 128, 0.7)',
                }}
                elevation={0}
            >
                <BottomNavigation component="nav" showLabels value={selectedValue}>
                    {tabs.map((tab) => (
                        <BottomNavigationAction
                            key={tab.path}
                            label={t(tab.label)}
                            icon={tab.icon}
                            sx={BottomNavigationActionSx}
                            onClick={(event: React.MouseEvent) => {
                                event.preventDefault();
                                router.push(tab.path);
                            }}
                        />
                    ))}
                </BottomNavigation>
            </Paper>
        </Box>
    );
};
