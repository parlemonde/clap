'use client';

import classNames from 'clsx';
import { usePathname } from 'next/navigation';
import { NavigationMenu } from 'radix-ui';
import * as React from 'react';

import { Link as NextLink } from '@frontend/components/navigation/Link';
import { useTranslation } from '@frontend/contexts/translationContext';
import { userContext } from '@frontend/contexts/userContext';
import { getTabs } from '@frontend/lib/get-tabs';

import styles from './bottom-nav-bar.module.scss';

export const BottomNavBar = () => {
    const { t } = useTranslation();
    const user = React.useContext(userContext);

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
                            <NavigationMenu.Link
                                asChild
                                active={tab.path === currentPath || (tab.path === '/create/3-storyboard' && currentPath === '/')}
                            >
                                <NextLink className={styles.navigationButton} href={tab.path}>
                                    <span style={{ marginBottom: '2px' }}>{tab.icon}</span>
                                    <span>{t(tab.label)}</span>
                                </NextLink>
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    ))}
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </footer>
    );
};
