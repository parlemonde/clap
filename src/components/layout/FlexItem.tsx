import React from 'react';

type FlexItemProps = {
    as?: React.ElementType | React.ReactElement;
    flexGrow?: React.CSSProperties['flexGrow'];
    flexShrink?: React.CSSProperties['flexShrink'];
    flexBasis?: React.CSSProperties['flexBasis'];
    alignSelf?: React.CSSProperties['alignSelf'];
    style?: React.CSSProperties;
    hasTextEllipsis?: boolean;
};

export const FlexItem = ({
    as = 'div',
    flexGrow = 0,
    flexShrink = 1,
    flexBasis = 'auto',
    alignSelf,
    style,
    hasTextEllipsis = false,
    children,
}: React.PropsWithChildren<FlexItemProps>) => {
    const textEllipsisStyle: React.CSSProperties = hasTextEllipsis
        ? {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
          }
        : {};
    if (React.isValidElement(as)) {
        return React.cloneElement(
            as,
            {
                style: { ...(as.props.style || {}), ...style, ...textEllipsisStyle, flexGrow, flexShrink, flexBasis, alignSelf },
            },
            children,
        );
    } else {
        return React.createElement(
            as,
            {
                style: { ...style, ...textEllipsisStyle, flexGrow, flexShrink, flexBasis, alignSelf },
            },
            children,
        );
    }
};
