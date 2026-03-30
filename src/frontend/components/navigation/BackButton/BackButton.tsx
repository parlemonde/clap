'use client';

import { ChevronLeftIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import * as React from 'react';
import type { I18nKeys } from 'src/i18n/locales';

import { Button } from '@frontend/components/layout/Button';
import { Link, startNProgress } from '@frontend/components/navigation/Link';
import { useTranslation } from '@frontend/contexts/translationContext';

import styles from './back-button.module.scss';

type BackButtonProps = {
    href: string;
    label?: I18nKeys;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
};

export const BackButton = ({ href, label = 'common.actions.back', onClick, className, style }: BackButtonProps) => {
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
                onClick={(event) => {
                    if (onClick) {
                        onClick();
                    }
                    startNProgress(href, event);
                }}
                leftIcon={<ChevronLeftIcon />}
            ></Button>
        </Link>
    );
};
