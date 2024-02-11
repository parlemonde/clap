'use client';

import * as Progress from '@radix-ui/react-progress';
import classNames from 'classnames';
import * as React from 'react';

import styles from './circular-progress.module.scss';

type CircularProgressProps = {
    color?: 'primary' | 'secondary';
    size?: number;
};
export const CircularProgress = ({ color = 'primary', size = 40 }: CircularProgressProps) => {
    return (
        <Progress.Root className={styles.progressRoot} style={{ width: size, height: size }} value={null}>
            <Progress.Indicator className={classNames(styles.progressIndicator, styles[`progressIndicator--${color}`])}>
                <svg className="" viewBox="0 0 40 40">
                    <circle className="" cx="20" cy="20" r="18" fill="none" strokeWidth="3"></circle>
                </svg>
            </Progress.Indicator>
        </Progress.Root>
    );
};
