import classNames from 'clsx';
import * as React from 'react';

import { Flex } from '@frontend/components/layout/Flex';

import { NavigationLogo } from './NavigationLogo';
import { NavigationMenu } from './NavigationMenu';
import styles from './top-nav-bar.module.scss';

export const TopNavBar = () => {
    return (
        <header className={classNames(styles.topNavBar, 'tablet-and-up-only')}>
            <div className={styles.container}>
                <Flex flexDirection="row" alignItems="center" justifyContent="space-between" isFullHeight className={styles.navItems}>
                    <NavigationLogo />
                    <NavigationMenu />
                </Flex>
            </div>
        </header>
    );
};
