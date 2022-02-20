import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import ElevationScroll from './ElevationScroll';
import NavBarTab from './NavBarTab';
import { UserServiceContext } from 'src/services/UserService';
import { getTabs } from 'src/util/tabs';

interface NavBarProps {
    title: string;
    homeLink: string;
    isOnAdmin?: boolean;
}

export const NavBar: React.FunctionComponent<NavBarProps> = (props: NavBarProps) => {
    const router = useRouter();
    const [value, setValue] = React.useState(0);
    const { user, isLoggedIn } = React.useContext(UserServiceContext);

    const tabs = getTabs(isLoggedIn, user !== null && user.type === 2, props.isOnAdmin || false);

    useEffect(() => {
        const navtabs = getTabs(isLoggedIn, user !== null && user.type === 2, props.isOnAdmin || false);
        const index = navtabs.reduce((i1, tab, i2) => (tab.path.split('/')[1] === router.pathname.split('/')[1] ? i2 : i1), -1);
        setValue(index + 1);
    }, [user, isLoggedIn, router.pathname, props.isOnAdmin]);

    const handleHomeLink = (event: React.MouseEvent): void => {
        event.preventDefault();
        router.push(props.isOnAdmin ? '/admin/themes' : props.homeLink);
    };

    const currentTab = value > tabs.length ? 0 : value;

    return (
        <Box sx={{ display: { xs: props.isOnAdmin ? 'block' : 'none', md: 'block' } }}>
            <ElevationScroll {...props}>
                <AppBar
                    position="fixed"
                    sx={{
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                >
                    <Container maxWidth="lg">
                        <Toolbar variant="dense" style={{ padding: 0 }}>
                            <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item>
                                    <a href={props.homeLink} style={{ color: 'white' }} onClick={handleHomeLink}>
                                        <img src="/pelico.svg" alt="logo" style={{ height: '36px', width: 'auto' }} />
                                        <Typography variant="h6" className="plm-logo-title">
                                            {props.isOnAdmin ? `Administrateur ${props.title}` : props.title}
                                        </Typography>
                                    </a>
                                </Grid>
                                <Grid item>
                                    <Tabs
                                        value={currentTab}
                                        aria-label="navbar"
                                        sx={{ '& .MuiTabs-indicator': { backgroundColor: (theme) => theme.palette.primary.main } }}
                                    >
                                        <NavBarTab label="" path="/" style={{ display: 'none' }} />
                                        {tabs.map((tab, index) => (
                                            <NavBarTab
                                                label={tab.label}
                                                path={tab.path}
                                                icon={tab.icon}
                                                key={index}
                                                selected={index === currentTab - 1}
                                            />
                                        ))}
                                    </Tabs>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </Container>
                </AppBar>
            </ElevationScroll>
            <Toolbar variant="dense" />
        </Box>
    );
};
