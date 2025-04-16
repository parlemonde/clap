'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import styles from './admin-drawer.module.scss';
import { Link as NextLink, startNProgress } from 'src/components/navigation/Link';

interface Tab {
    label: string;
    path: string;
}

const adminTabs: Tab[] = [
    {
        label: 'Thèmes',
        path: '/admin/themes',
    },
    {
        label: 'Scénarios',
        path: '/admin/scenarios',
    },
    {
        label: 'Questions',
        path: '/admin/questions',
    },
    {
        label: 'Langues',
        path: '/admin/languages',
    },
    {
        label: 'Utilisateurs',
        path: '/admin/users',
    },
];

export const AdminDrawer = () => {
    const currentPathName = usePathname();

    return (
        <div className={styles.AdminDrawer}>
            <NavigationMenu.Root className={styles.AdminDrawer__Navigation}>
                <NavigationMenu.List>
                    {adminTabs.map((tab) => (
                        <NavigationMenu.Item key={tab.path}>
                            <NextLink href={tab.path} legacyBehavior passHref>
                                <NavigationMenu.Link
                                    onClick={(event) => {
                                        startNProgress(tab.path, event);
                                    }}
                                    active={currentPathName.startsWith(tab.path)}
                                    className={styles.AdminDrawer__NavigationButton}
                                >
                                    {tab.label}
                                </NavigationMenu.Link>
                            </NextLink>
                        </NavigationMenu.Item>
                    ))}
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </div>
    );
};
