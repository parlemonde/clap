import React from 'react';

type FlexProps = {
    as?: React.ElementType | React.ReactElement;
    flexDirection?: React.CSSProperties['flexDirection'];
    flexWrap?: React.CSSProperties['flexWrap'];
    justifyContent?: React.CSSProperties['justifyContent'];
    alignItems?: React.CSSProperties['alignItems'];
    style?: React.CSSProperties;
    isInline?: boolean;
    isFullWidth?: boolean;
    isFullHeight?: boolean;
};
export const Flex = ({
    children,
    as = 'div',
    style = {},
    flexDirection = 'row',
    flexWrap = 'nowrap',
    justifyContent = 'flex-start',
    alignItems = 'center',
    isInline = false,
    isFullHeight = false,
    isFullWidth = false,
}: React.PropsWithChildren<FlexProps>) => {
    const flexStyle: React.CSSProperties = {
        ...style,
        display: isInline ? 'inline-flex' : 'flex',
        flexWrap,
        flexDirection,
        justifyContent,
        alignItems,
    };
    if (isFullHeight) {
        flexStyle.height = '100%';
    }
    if (isFullWidth) {
        flexStyle.width = '100%';
    }

    if (React.isValidElement(as)) {
        return React.cloneElement(
            as,
            {
                style: { ...(as.props.style || {}), ...flexStyle },
            },
            children,
        );
    } else {
        return React.createElement(
            as,
            {
                style: flexStyle,
            },
            children,
        );
    }
};
