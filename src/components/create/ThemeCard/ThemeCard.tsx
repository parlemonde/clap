'use client';

import Image from 'next/image';
import * as React from 'react';

import styles from './theme-card.module.scss';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { Text } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';

const COLORS = ['rgb(96, 105, 243)', 'rgb(213, 89, 84)', 'rgb(250, 225, 108)', 'rgb(62, 65, 87)', 'rgb(215, 213, 209)', 'rgb(162, 220, 174)'];

type ThemeCardProps = {
    index: number;
    imageUrl?: string | null;
    name: string;
    href: string;
};
export const ThemeCard = ({ index, imageUrl, name, href }: ThemeCardProps) => {
    const [showBackgroundColor, setShowBackgroundColor] = React.useState(true);

    return (
        <Link href={href} prefetch={false} className={styles.themeCard}>
            <KeepRatio ratio={0.7}>
                <div style={{ backgroundColor: showBackgroundColor ? COLORS[index % COLORS.length] : 'unset' }} className={styles.themeCardImage}>
                    {imageUrl && (
                        <Image
                            onLoadingComplete={() => {
                                setShowBackgroundColor(false);
                            }}
                            layout="fill"
                            src={imageUrl}
                            alt="theme image"
                        />
                    )}
                </div>
            </KeepRatio>
            <Text variant="p" marginTop="xs">
                {name}
            </Text>
        </Link>
    );
};
