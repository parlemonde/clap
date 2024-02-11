import * as React from 'react';

import type { MarginProps, PaddingProps } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '../css-styles';

type FormProps = Omit<JSX.IntrinsicElements['form'], 'ref'> & MarginProps & PaddingProps;
export const Form = ({ children, style = {}, ...props }: React.PropsWithChildren<FormProps>) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);
    return (
        <form {...otherProps} style={{ ...style, ...getMarginAndPaddingStyle(marginAndPaddingProps) }}>
            {children}
        </form>
    );
};
