import classNames from 'clsx';
import * as React from 'react';

import styles from './divider.module.scss';
import type { MarginProps } from '../css-styles';
import { getMarginAndPaddingStyle } from '../css-styles';

type DividerProps = {
    style?: React.CSSProperties;
    className?: string;
} & MarginProps;
export const Divider = ({ style = {}, className, ...marginProps }: DividerProps) => {
    return <hr className={classNames(styles.Divider, className)} style={{ ...style, ...getMarginAndPaddingStyle(marginProps) }}></hr>;
};
