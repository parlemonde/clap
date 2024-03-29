import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

const APP_URL = process.env.NEXT_PUBLIC_HOST_URL || 'https://clap.parlemonde.org';
const APP_NAME = 'Clap!';
const APP_DESCRIPTION = 'Clap! Une application pour créer de super vidéos.';

class MyDocument extends Document {
    render(): JSX.Element {
        const locale = this.props.__NEXT_DATA__.props.currentLocale || 'fr';
        return (
            <Html lang={locale}>
                <Head>
                    <meta name="application-name" content={APP_NAME} />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content={APP_NAME} />
                    <meta name="description" content={APP_DESCRIPTION} />
                    <meta name="format-detection" content="telephone=no" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="msapplication-config" content="/browserconfig.xml" />
                    <meta name="msapplication-TileColor" content="#6065fc" />
                    <meta name="msapplication-tap-highlight" content="no" />
                    <meta name="theme-color" content="#6065fc" />

                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#6065fc" />
                    <link rel="shortcut icon" href="/favicon.ico" />

                    <meta name="twitter:card" content={APP_DESCRIPTION} />
                    <meta name="twitter:url" content={APP_URL} />
                    <meta name="twitter:title" content={APP_NAME} />
                    <meta name="twitter:description" content={APP_DESCRIPTION} />
                    <meta name="twitter:image" content={`${APP_URL}/android-chrome-192x192.png`} />
                    <meta name="twitter:creator" content="ParLeMonde" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content={APP_NAME} />
                    <meta property="og:description" content={APP_DESCRIPTION} />
                    <meta property="og:site_name" content={APP_NAME} />
                    <meta property="og:url" content={APP_URL} />
                    <meta property="og:image" content={`${APP_URL}/apple-touch-icon.png`} />
                </Head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
