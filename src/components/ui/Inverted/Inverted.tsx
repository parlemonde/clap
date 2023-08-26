import classNames from 'classnames';
import * as React from 'react';

import styles from './inverted.module.scss';

type InvertedProps = {
    isRound?: boolean;
    color?: 'primary' | 'secondary';
};
export const Inverted = ({ children, isRound = false, color = 'primary' }: React.PropsWithChildren<InvertedProps>) => {
    return (
        <span
            className={classNames(styles.inverted, styles[`inverted__${color}`], {
                [styles.inverted__round]: isRound,
            })}
        >
            {children}
        </span>
    );
};
