import classNames from 'classnames';
import * as React from 'react';

import { NavigationLogo } from './NavigationLogo';
import { NavigationMenu } from './NavigationMenu';
import styles from './top-nav-bar.module.scss';
import { Flex } from 'src/components/layout/Flex';

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
