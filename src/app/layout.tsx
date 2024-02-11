import classNames from 'classnames';
import type { Metadata, Viewport } from 'next';
import * as React from 'react';

import 'normalize.css/normalize.css';
import 'src/styles/globals.scss';

import styles from './app.module.scss';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getLocales } from 'src/actions/get-locales';
import { BottomNavBar } from 'src/components/navigation/BottomNavBar';
import { NProgressDone } from 'src/components/navigation/NProgress';
import { TopNavBar } from 'src/components/navigation/TopNavBar';
import { Toasts } from 'src/components/ui/Toasts';
import { TooltipProvider } from 'src/contexts/TooltipProvider';
import { TranslationContextProvider } from 'src/contexts/tanslationContext';
import { UserContextProvider } from 'src/contexts/userContext';
import { openSansFont, alegreyaSansFont, littleDaysFont } from 'src/fonts';

export const metadata: Metadata = {
    title: 'Clap!',
    description: 'Clap! Une application pour créer de super vidéos.',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
};

const APP_URL = process.env.HOST_URL || 'https://clap.parlemonde.org';
const APP_NAME = 'Clap!';
const APP_DESCRIPTION = 'Clap! Une application pour créer de super vidéos.';

export default async function RootLayout({ children }: React.PropsWithChildren) {
    const { currentLocale, locales } = await getLocales();
    const user = await getCurrentUser();

    return (
        <html lang={currentLocale}>
            <head>
                <meta name="application-name" content={APP_NAME} />
                <meta name="theme-color" content="#6065fc" />

                <link rel="shortcut icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/static/manifest.json" />
                <link rel="mask-icon" color="#6065fc" />

                <meta name="twitter:card" content={APP_DESCRIPTION} />
                <meta name="twitter:url" content={APP_URL} />
                <meta name="twitter:title" content={APP_NAME} />
                <meta name="twitter:description" content={APP_DESCRIPTION} />
                <meta name="twitter:image" content={`${APP_URL}/static/images/android-chrome-192x192.png`} />
                <meta name="twitter:creator" content="ParLeMonde" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={APP_NAME} />
                <meta property="og:description" content={APP_DESCRIPTION} />
                <meta property="og:site_name" content={APP_NAME} />
                <meta property="og:url" content={APP_URL} />
                <meta property="og:image" content={`${APP_URL}/static/images/apple-touch-icon.png`} />
            </head>
            <body
                className={classNames(openSansFont.className, styles.body, openSansFont.variable, alegreyaSansFont.variable, littleDaysFont.variable)}
            >
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <TooltipProvider delayDuration={0}>
                    <TranslationContextProvider language={currentLocale} locales={locales}>
                        <UserContextProvider initialUser={user}>
                            <TopNavBar />
                            {children}
                            <BottomNavBar />
                        </UserContextProvider>
                    </TranslationContextProvider>
                </TooltipProvider>
                <Toasts />
                <NProgressDone />
            </body>
        </html>
    );
}
