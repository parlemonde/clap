import classNames from 'classnames';
import type { Metadata } from 'next';
import * as React from 'react';

import styles from './app.module.scss';
import { openSansFont, alegreyaSansFont, littleDaysFont } from 'src/fonts';

import 'normalize.css/normalize.css';
import 'src/styles/globals.scss';

export const metadata: Metadata = {
    title: 'Clap!',
    description: 'Clap! is web application to create storyboard and videos script for an educational purpose.',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
    return (
        <html lang="en">
            <body
                className={classNames(openSansFont.className, styles.body, openSansFont.variable, alegreyaSansFont.variable, littleDaysFont.variable)}
            >
                <noscript>You need to enable JavaScript to run this app.</noscript>
                {children}
            </body>
        </html>
    );
}
