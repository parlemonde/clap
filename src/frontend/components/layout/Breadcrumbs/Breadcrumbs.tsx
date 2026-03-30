import classNames from 'clsx';
import * as React from 'react';

import { Text } from '@frontend/components/layout/Typography';
import type { MarginProps } from '@frontend/components/layout/css-styles';
import { getMarginAndPaddingStyle } from '@frontend/components/layout/css-styles';
import { Link } from '@frontend/components/navigation/Link';

import styles from './breadcrumbs.module.scss';

type BreadcrumbLink = {
    href: string;
    label: string | React.ReactNode;
};

type BreadcrumbsProps = {
    links: BreadcrumbLink[];
    currentLabel: string | React.ReactNode;
    className?: string;
} & MarginProps;
export const Breadcrumbs = ({ links, currentLabel, className, ...marginProps }: BreadcrumbsProps) => {
    const marginStyle = getMarginAndPaddingStyle(marginProps);
    return (
        <nav aria-label="breadcrumb" className={classNames(styles.breadcrumbs, className)} style={marginStyle}>
            <ol>
                {links.map((link, index) => (
                    <React.Fragment key={index}>
                        <li>
                            <Link href={link.href} className={styles.link}>
                                {typeof link.label === 'string' ? <Text>{link.label}</Text> : link.label}
                            </Link>
                        </li>
                        <li aria-hidden="true" className={styles.separator}>
                            <SeparatorIcon />
                        </li>
                    </React.Fragment>
                ))}
                <li>
                    <Text>{currentLabel}</Text>
                </li>
            </ol>
        </nav>
    );
};

const SeparatorIcon = () => (
    <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
    </svg>
);
