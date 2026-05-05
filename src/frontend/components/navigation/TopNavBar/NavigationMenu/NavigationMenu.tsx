'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NavigationMenu as RadixNavigationMenu } from 'radix-ui';
import * as React from 'react';

import { Link as NextLink } from '@frontend/components/navigation/Link';
import { userContext } from '@frontend/contexts/userContext';
import { getTabs } from '@frontend/lib/get-tabs';

import styles from './navigation-menu.module.css';

export const NavigationMenu = () => {
    const t = useTranslations();
    const user = React.useContext(userContext);

    const currentPathName = usePathname().split('/')[1];
    const currentPath = currentPathName && currentPathName !== 'create' ? `/${currentPathName}` : '/';
    const isOnAdmin = currentPath === '/admin';
    const tabs = getTabs(user?.role, isOnAdmin);

    return (
        <RadixNavigationMenu.Root className={styles.navigation}>
            <RadixNavigationMenu.List>
                {tabs.map((tab) => (
                    <RadixNavigationMenu.Item key={tab.path}>
                        <RadixNavigationMenu.Link
                            asChild
                            active={tab.path === currentPath || (tab.path === '/create/3-storyboard' && currentPath === '/')}
                        >
                            <NextLink href={tab.path} className={styles.navigationButton}>
                                <span>{t(tab.label)}</span>
                                {tab.icon}
                            </NextLink>
                        </RadixNavigationMenu.Link>
                    </RadixNavigationMenu.Item>
                ))}
            </RadixNavigationMenu.List>
        </RadixNavigationMenu.Root>
    );
};
