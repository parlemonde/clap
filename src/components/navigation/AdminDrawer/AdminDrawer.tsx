import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import styles from './admin-drawer.module.scss';

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
    {
        label: 'Statistiques',
        path: '/admin/statistics',
    },
];

export const AdminDrawer = () => {
    const router = useRouter();

    return (
        <div className={styles.AdminDrawer}>
            <NavigationMenu.Root className={styles.AdminDrawer__Navigation}>
                <NavigationMenu.List>
                    {adminTabs.map((tab) => (
                        <NavigationMenu.Item key={tab.path}>
                            <Link href={tab.path} passHref>
                                <NavigationMenu.Link active={router.asPath.startsWith(tab.path)} className={styles.AdminDrawer__NavigationButton}>
                                    {tab.label}
                                </NavigationMenu.Link>
                            </Link>
                        </NavigationMenu.Item>
                    ))}
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </div>
    );
};
