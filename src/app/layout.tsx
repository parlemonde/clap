import classNames from 'clsx';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Tooltip } from 'radix-ui';
import * as React from 'react';

import { AlertModal } from '@frontend/components/collaboration/AlertModal';
import { BottomNavBar } from '@frontend/components/navigation/BottomNavBar';
import { NProgressDone } from '@frontend/components/navigation/NProgress';
import { TopNavBar } from '@frontend/components/navigation/TopNavBar';
import { Toasts } from '@frontend/components/ui/Toasts';
import { UserContextProvider } from '@frontend/contexts/userContext';
import { openSansFont, alegreyaSansFont, littleDaysFont } from '@frontend/fonts';
import { getCurrentUser } from '@server/auth/get-current-user';

import styles from './app.module.css';

import 'normalize.css/normalize.css';
import 'nprogress/nprogress.css';
import './globals.css';
import 'react-html5-camera-photo/build/css/index.css';

const APP_URL = process.env.HOST_URL || '';
const APP_NAME = 'Clap!';
const APP_DESCRIPTION = 'Clap! Une application pour créer de super vidéos.';

export const metadata: Metadata = {
    metadataBase: APP_URL ? new URL(APP_URL) : undefined,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    applicationName: APP_NAME,
    twitter: {
        card: 'summary_large_image',
        site: APP_URL,
        description: APP_DESCRIPTION,
        title: APP_NAME,
        images: '/static/images/android-chrome-192x192.png',
        creator: 'ParLeMonde',
    },
    openGraph: {
        type: 'website',
        title: APP_NAME,
        description: APP_DESCRIPTION,
        siteName: APP_NAME,
        url: APP_URL,
        images: [{ url: '/static/images/apple-touch-icon.png', width: 180, height: 180 }],
    },
    icons: {
        shortcut: '/favicon.ico',
        icon: [
            {
                url: '/static/images/favicon-32x32.png',
                sizes: '32x32',
            },
            { url: '/static/images/favicon-16x16.png', sizes: '16x16' },
        ],
        apple: '/static/images/apple-touch-icon.png',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    themeColor: '#6065fc',
};

export default async function RootLayout({ children }: React.PropsWithChildren) {
    const [currentLocale, user] = await Promise.all([getLocale(), getCurrentUser()]);

    return (
        <html lang={currentLocale}>
            <body
                className={classNames(openSansFont.className, styles.body, openSansFont.variable, alegreyaSansFont.variable, littleDaysFont.variable)}
            >
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <Tooltip.Provider delayDuration={0}>
                    <NextIntlClientProvider>
                        <UserContextProvider user={user}>
                            <TopNavBar />
                            {children}
                            <BottomNavBar />
                            <AlertModal />
                        </UserContextProvider>
                    </NextIntlClientProvider>
                </Tooltip.Provider>
                <Toasts />
                <NProgressDone />
            </body>
        </html>
    );
}
