import classNames from 'clsx';
import * as React from 'react';

import styles from './admin-tile.module.scss';
import type { MarginProps } from 'src/components/layout';
import { getMarginAndPaddingStyle } from 'src/components/layout';
import { Flex, FlexItem } from 'src/components/layout/Flex';
import { Title } from 'src/components/layout/Typography';

type AdminTileProps = {
    title: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
} & MarginProps;

export const AdminTile = ({ title, actions, className, children, ...marginProps }: React.PropsWithChildren<AdminTileProps>) => {
    return (
        <div className={classNames(styles.AdminTile, className)} style={getMarginAndPaddingStyle(marginProps)}>
            <Flex className={styles.AdminTile__Header} flexDirection="row" alignItems="center" justifyContent="flex-start">
                <FlexItem flexGrow={1} flexBasis={0}>
                    {typeof title === 'string' ? (
                        <Title variant="h2" color="inherit">
                            {title}
                        </Title>
                    ) : (
                        title
                    )}
                </FlexItem>
                {actions && <FlexItem>{actions}</FlexItem>}
            </Flex>
            {children}
        </div>
    );
};
