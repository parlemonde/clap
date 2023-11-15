import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import classNames from 'classnames';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import styles from './top-nav-bar.module.scss';
import { Box } from 'src/components/layout/Box';
import { Container } from 'src/components/layout/Container';
import { Flex } from 'src/components/layout/Flex';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import PelicoSVG from 'src/svg/pelico.svg';
import { getTabs } from 'src/utils/tabs';
import { UserType } from 'types/models/user.type';

export const TopNavBar = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);

    const currentPath = `/${router.asPath.split('/')[1]}`;
    const isOnAdmin = currentPath === '/admin';
    const tabs = getTabs(user !== null, user !== null && user.type >= UserType.ADMIN, isOnAdmin);

    return (
        <header className={classNames(styles.topNavBar, 'tablet-and-up-only')}>
            <div className={styles.header}>
                <Container className={styles.container}>
                    <Flex flexDirection="row" alignItems="center" justifyContent="space-between" isFullHeight>
                        <NextLink
                            href="/create"
                            className={styles.logo}
                            data-active={currentPath === '/create' ? '' : undefined}
                            aria-current={currentPath === '/create' ? 'page' : undefined}
                            aria-label="logo"
                        >
                            <PelicoSVG style={{ height: '36px', width: 'auto' }} />
                            <Box as="span" marginLeft="md">
                                Clap!
                            </Box>
                        </NextLink>
                        <NavigationMenu.Root className={styles.navigation}>
                            <NavigationMenu.List>
                                {tabs.map((tab) => (
                                    <NavigationMenu.Item key={tab.path}>
                                        <NextLink href={tab.path} passHref legacyBehavior>
                                            <NavigationMenu.Link active={tab.path === currentPath} className={styles.navigationButton}>
                                                <span>{t(tab.label)}</span>
                                                {tab.icon}
                                            </NavigationMenu.Link>
                                        </NextLink>
                                    </NavigationMenu.Item>
                                ))}
                            </NavigationMenu.List>
                        </NavigationMenu.Root>
                    </Flex>
                </Container>
            </div>
        </header>
    );
};
