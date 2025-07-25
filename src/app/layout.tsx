import classNames from 'clsx';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Tooltip } from 'radix-ui';
import * as React from 'react';
import 'normalize.css/normalize.css';
import 'nprogress/nprogress.css';
import 'src/styles/globals.scss';
import 'react-html5-camera-photo/build/css/index.css';

import styles from './app.module.scss';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getLocales } from 'src/actions/get-locales';
import { AlertModal } from 'src/components/collaboration/AlertModal';
import { BottomNavBar } from 'src/components/navigation/BottomNavBar';
import { NProgressDone } from 'src/components/navigation/NProgress';
import { TopNavBar } from 'src/components/navigation/TopNavBar';
import { Toasts } from 'src/components/ui/Toasts';
import { TranslationContextProvider } from 'src/contexts/translationContext';
import { UserContextProvider } from 'src/contexts/userContext';
import { openSansFont, alegreyaSansFont, littleDaysFont } from 'src/fonts';

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
    const [{ currentLocale, locales }, user] = await Promise.all([getLocales(), getCurrentUser()]);
    const cookieStore = await cookies();
    const accessTokenCookie = cookieStore.get('access-token');
    const isSessionExpired = accessTokenCookie !== undefined && user === undefined;

    return (
        <html lang={currentLocale}>
            <body
                className={classNames(openSansFont.className, styles.body, openSansFont.variable, alegreyaSansFont.variable, littleDaysFont.variable)}
            >
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <Tooltip.Provider delayDuration={0}>
                    <TranslationContextProvider language={currentLocale} locales={locales}>
                        <UserContextProvider initialUser={user} isSessionExpired={isSessionExpired}>
                            <TopNavBar />
                            {children}
                            <BottomNavBar />
                            <AlertModal />
                        </UserContextProvider>
                    </TranslationContextProvider>
                </Tooltip.Provider>
                <Toasts />
                <NProgressDone />
            </body>
        </html>
    );
}
