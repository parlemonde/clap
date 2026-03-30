import classNames from 'clsx';
import * as React from 'react';

import type { MarginProps } from '@frontend/components/layout/css-styles';
import { getMarginAndPaddingStyle } from '@frontend/components/layout/css-styles';

import styles from './divider.module.scss';

type DividerProps = {
    style?: React.CSSProperties;
    className?: string;
} & MarginProps;
export const Divider = ({ style = {}, className, ...marginProps }: DividerProps) => {
    return <hr className={classNames(styles.Divider, className)} style={{ ...style, ...getMarginAndPaddingStyle(marginProps) }}></hr>;
};
