import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import classNames from 'classnames';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import styles from './bottom-nav-bar.module.scss';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { getTabs } from 'src/utils/tabs';
import { UserType } from 'types/models/user.type';

export const BottomNavBar = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);

    const currentPath = `/${router.asPath.split('/')[1]}`;
    const isOnAdmin = currentPath === '/admin';
    const tabs = getTabs(user !== null, user !== null && user.type >= UserType.ADMIN, isOnAdmin);

    if (isOnAdmin) {
        return null;
    }

    return (
        <footer className={classNames(styles.bottomNavBar, 'phone-only')}>
            <NavigationMenu.Root className={styles.navigationMenu}>
                <NavigationMenu.List className={styles.navigationList}>
                    {tabs.map((tab) => (
                        <NavigationMenu.Item key={tab.path} className={styles.navigationItem}>
                            <NextLink href={tab.path} passHref legacyBehavior>
                                <NavigationMenu.Link active={tab.path === currentPath} className={styles.navigationButton}>
                                    <span style={{ marginBottom: '2px' }}>{tab.icon}</span>
                                    <span>{t(tab.label)}</span>
                                </NavigationMenu.Link>
                            </NextLink>
                        </NavigationMenu.Item>
                    ))}
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </footer>
    );
};
