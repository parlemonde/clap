import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { AppBar, Box, Toolbar, Container, useScrollTrigger } from '@mui/material';

import { Flex } from 'src/components/layout/Flex';
import { FlexItem } from 'src/components/layout/FlexItem';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import PelicoSVG from 'src/svg/pelico.svg';
import { getTabs } from 'src/utils/tabs';
import { UserType } from 'types/models/user.type';

const ElevationScroll = ({ children }: { children: React.ReactElement }) => {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    });
    return React.cloneElement(children, {
        elevation: trigger ? 4 : 0,
    });
};

export const TopNavBar = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);
    const currentPath = React.useMemo(() => {
        return `/${router.pathname.split('/')[1]}`;
    }, [router]);

    const isOnAdmin = currentPath === '/admin';
    const tabs = React.useMemo(() => getTabs(user !== null, user !== null && user.type >= UserType.ADMIN, isOnAdmin), [user, isOnAdmin]);

    return (
        <Box component="header" sx={{ display: { xs: isOnAdmin ? 'block' : 'none', md: 'block' } }}>
            <ElevationScroll>
                <AppBar
                    component="div"
                    sx={{
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                >
                    <Toolbar variant="dense">
                        <Flex as={<Container component="nav" maxWidth="lg"></Container>} isFullWidth>
                            <Link href="/create" passHref>
                                <a style={{ display: 'flex' }} aria-label="home">
                                    <PelicoSVG style={{ height: '36px', width: 'auto' }} />
                                </a>
                            </Link>
                            <FlexItem flexGrow={1} flexBasis={0} hasTextEllipsis>
                                <Link href="/create" passHref>
                                    <a style={{ color: 'inherit', textDecoration: 'none' }}>
                                        <h6 className="logo-title">Clap!</h6>
                                    </a>
                                </Link>
                            </FlexItem>

                            {tabs.map((tab) => (
                                <Link key={tab.path} href={tab.path} passHref>
                                    <Box
                                        component="a"
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            textDecoration: 'none',
                                            backgroundColor: currentPath === tab.path ? 'white' : 'unset',
                                            fontFamily: `'Alegreya Sans', sans-serif`,
                                            padding: '0.2rem 0.8rem',
                                            minWidth: '160px',
                                            marginLeft: '1.5rem',
                                            color: (t) => (currentPath === tab.path ? t.palette.primary.main : 'white'),
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <span style={{ marginRight: '0.5rem' }}>{t(tab.label)}</span>
                                        {tab.icon}
                                    </Box>
                                </Link>
                            ))}
                        </Flex>
                    </Toolbar>
                </AppBar>
            </ElevationScroll>
            <Toolbar variant="dense" />
        </Box>
    );
};
