import classNames from 'clsx';
import * as React from 'react';

import styles from './linear-progress.module.scss';

type LinearProgressProps = {
    value?: number;
    color?: 'primary' | 'secondary';
};
export const LinearProgress = ({ value = 0, color = 'primary' }: LinearProgressProps) => {
    return (
        <div className={classNames(styles.LinearProgress, styles[`LinearProgress--${color}`])}>
            <div className={styles.LinearProgress__Bar} style={{ width: `${Math.max(0, Math.min(100, Math.round(value)))}%` }} />
        </div>
    );
};
