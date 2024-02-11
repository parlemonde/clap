'use client';

import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import styles from './navigation-menu.module.scss';
import { Link as NextLink, startNProgress } from 'src/components/navigation/Link';
import { useTranslation } from 'src/contexts/tanslationContext';
import { userContext } from 'src/contexts/userContext';
import { getTabs } from 'src/utils/tabs';

export const NavigationMenu = () => {
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);

    const currentPathName = usePathname().split('/')[1];
    const currentPath = currentPathName && currentPathName !== 'create' ? `/${currentPathName}` : '/';
    const isOnAdmin = currentPath === '/admin';
    const tabs = getTabs(user !== null, user !== null /* && user.type >= UserType.ADMIN */, isOnAdmin);

    return (
        <RadixNavigationMenu.Root className={styles.navigation}>
            <RadixNavigationMenu.List>
                {tabs.map((tab) => (
                    <RadixNavigationMenu.Item key={tab.path}>
                        <NextLink href={tab.path} passHref legacyBehavior>
                            <RadixNavigationMenu.Link
                                active={tab.path === currentPath}
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
