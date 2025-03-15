'use client';

import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import styles from './navigation-menu.module.scss';
import { Link as NextLink, startNProgress } from 'src/components/navigation/Link';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import { getTabs } from 'src/lib/get-tabs';

export const NavigationMenu = () => {
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);

    const currentPathName = usePathname().split('/')[1];
    const currentPath = currentPathName && currentPathName !== 'create' ? `/${currentPathName}` : '/';
    const isOnAdmin = currentPath === '/admin';
    const tabs = getTabs(user?.role, isOnAdmin);

    return (
        <RadixNavigationMenu.Root className={styles.navigation}>
            <RadixNavigationMenu.List>
                {tabs.map((tab) => (
                    <RadixNavigationMenu.Item key={tab.path}>
                        <NextLink href={tab.path} passHref legacyBehavior>
                            <RadixNavigationMenu.Link
                                active={tab.path === currentPath || (tab.path === '/create/3-storyboard' && currentPath === '/')}
                                onClick={(event) => {
                                    startNProgress(tab.path, event);
                                }}
                                className={styles.navigationButton}
                            >
                                <span>{t(tab.label)}</span>
                                {tab.icon}
                            </RadixNavigationMenu.Link>
                        </NextLink>
                    </RadixNavigationMenu.Item>
                ))}
            </RadixNavigationMenu.List>
        </RadixNavigationMenu.Root>
    );
};
