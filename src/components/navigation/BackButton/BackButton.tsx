import { ChevronLeftIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import Link from 'next/link';
import * as React from 'react';

import styles from './back-button.module.scss';
import { Button } from 'src/components/layout/Button';
import { useTranslation } from 'src/i18n/useTranslation';

type BackButtonProps = {
    href: string;
    label?: string;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
};

export const BackButton = ({ href, label = 'back', onClick, className, style }: BackButtonProps) => {
    const { t } = useTranslation();
    return (
        <Link href={href} passHref legacyBehavior>
            <Button
                color="primary"
                variant="borderless"
                label={t(label)}
                className={classNames(styles.backButton, className)}
                as="a"
                style={style}
                size="md"
                onClick={onClick}
                leftIcon={<ChevronLeftIcon />}
            ></Button>
        </Link>
    );
};
