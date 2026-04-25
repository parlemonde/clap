'use client';

import { usePathname } from 'next/navigation';
import { NavigationMenu } from 'radix-ui';
import * as React from 'react';

import { Link as NextLink } from '@frontend/components/navigation/Link';

import styles from './admin-drawer.module.css';

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
                            <NavigationMenu.Link asChild active={currentPathName.startsWith(tab.path)}>
                                <NextLink href={tab.path} className={styles.AdminDrawer__NavigationButton}>
                                    {tab.label}
                                </NextLink>
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    ))}
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </div>
    );
};
