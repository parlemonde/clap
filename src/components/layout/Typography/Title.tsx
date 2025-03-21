import classNames from 'clsx';
import * as React from 'react';

import type { MarginProps, PaddingProps } from '..';
import { getMarginAndPaddingStyle } from '../css-styles';

type TitleProps = {
    id?: string;
    variant?: 'h1' | 'h2' | 'h3';
    color?: 'primary' | 'secondary' | 'inherit';
    className?: string;
    style?: React.CSSProperties;
} & MarginProps &
    PaddingProps;
export const Title = ({
    id,
    variant = 'h1',
    color = 'primary',
    className,
    style = {},
    children,
    ...marginAndPaddingProps
}: React.PropsWithChildren<TitleProps>) => {
    return React.createElement(
        variant,
        {
            style: {
                ...style,
                ...getMarginAndPaddingStyle(marginAndPaddingProps),
            },
            className: classNames(className, `color-${color}`),
            id,
        },
        children,
    );
};
