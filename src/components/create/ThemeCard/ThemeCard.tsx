import Image from 'next/legacy/image';
import Link from 'next/link';
import * as React from 'react';

import styles from './theme-card.module.scss';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { Placeholder } from 'src/components/layout/Placeholder';
import { Text } from 'src/components/layout/Typography';

const COLORS = ['rgb(96, 105, 243)', 'rgb(213, 89, 84)', 'rgb(250, 225, 108)', 'rgb(62, 65, 87)', 'rgb(215, 213, 209)', 'rgb(162, 220, 174)'];

type ThemeCardProps = {
    index: number;
    imageUrl?: string | null;
    name: string;
    href: string;
};
const ThemeCard = ({ index, imageUrl, name, href }: ThemeCardProps) => {
    const [showBackgroundColor, setShowBackgroundColor] = React.useState(true);

    return (
        <Link href={href} className={styles.themeCard}>
            <KeepRatio ratio={0.7}>
                <div style={{ backgroundColor: showBackgroundColor ? COLORS[index % COLORS.length] : 'unset' }} className={styles.themeCardImage}>
                    {imageUrl && (
                        <Image
                            onLoadingComplete={() => {
                                setShowBackgroundColor(false);
                            }}
                            layout="fill"
                            src={imageUrl}
                            unoptimized
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

const ThemeCardPlaceholder = () => {
    return (
        <div style={{ textAlign: 'center' }}>
            <KeepRatio ratio={0.7}>
                <Placeholder width="100%" height="100%" />
            </KeepRatio>
            <Text variant="p" marginTop="xs">
                <Placeholder variant="text" width="80%" />
            </Text>
        </div>
    );
};
ThemeCard.Placeholder = ThemeCardPlaceholder;

export { ThemeCard };
