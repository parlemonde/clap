'use client';

import classNames from 'clsx';
import { usePathname } from 'next/navigation';
import { NavigationMenu } from 'radix-ui';
import * as React from 'react';

import styles from './bottom-nav-bar.module.scss';
import { Link as NextLink, startNProgress } from 'src/components/navigation/Link';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import { getTabs } from 'src/lib/get-tabs';

export const BottomNavBar = () => {
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);

    const currentPathName = usePathname().split('/')[1];
    const currentPath = currentPathName && currentPathName !== 'create' ? `/${currentPathName}` : '/';
    const isOnAdmin = currentPath === '/admin';
    const tabs = getTabs(user?.role);

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
                                <NavigationMenu.Link
                                    active={tab.path === currentPath || (tab.path === '/create/3-storyboard' && currentPath === '/')}
                                    onClick={(event) => {
                                        startNProgress(tab.path, event);
                                    }}
                                    className={styles.navigationButton}
                                >
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
