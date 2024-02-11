import type { IconProps } from '@radix-ui/react-icons/dist/types';
import classNames from 'classnames';
import * as React from 'react';

import type { ButtonProps } from './Button';
import { Button } from './Button';
import styles from './icon-button.module.scss';

type IconButtonProps = Omit<ButtonProps, 'label' | 'leftIcon' | 'rightIcon'> & {
    icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
    iconProps?: IconProps & React.RefAttributes<SVGSVGElement>;
};
const IconButtonWithRef = (
    { icon: Icon, iconProps, size, ...props }: IconButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
) => {
    return (
        <Button
            label={<Icon width={20} height={20} {...iconProps} />}
            {...props}
            ref={ref}
            className={classNames(props.className, styles.iconButton, styles[`iconButton--${size}`])}
        />
    );
};

export const IconButton = React.forwardRef(IconButtonWithRef);
