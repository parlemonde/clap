import 'normalize.css/normalize.css';
import 'nprogress/nprogress.css';
import 'react-html5-camera-photo/build/css/index.css';

import 'src/styles/fonts.scss';
import 'src/styles/globals.scss';

import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import App from 'next/app';
import type { AppProps, AppInitialProps, AppContext } from 'next/app';
import Head from 'next/head';
import NProgress from 'nprogress';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AdminDrawer } from 'src/components/navigation/AdminDrawer';
import { BottomNavBar } from 'src/components/navigation/BottomNavBar';
import { TopNavBar } from 'src/components/navigation/TopNavBar';
import { Toasts } from 'src/components/ui/Toasts';
import { UserContextProvider } from 'src/contexts/userContext';
import { TranslationContextProvider } from 'src/i18n/useTranslation';
import { getInitialData } from 'src/utils/data';
import { HTTP_DEFAULT_HEADERS } from 'src/utils/http-request';
import type { User } from 'types/models/user.type';

interface MyAppOwnProps {
    locales: Record<string, string>;
    currentLocale: string;
    csrfToken: string | null;
    user: User | null;
}
type MyAppProps = AppProps & MyAppOwnProps;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 3600000, // 1 hour
        },
    },
});

const MyApp: React.FunctionComponent<MyAppProps> & {
    getInitialProps(appContext: AppContext): Promise<AppInitialProps>;
} = ({ Component, pageProps, router, user, csrfToken, currentLocale, locales }: MyAppProps) => {
    const onRouterChangeStart = (): void => {
        NProgress.configure({ showSpinner: false });
        NProgress.start();
    };
    const onRouterChangeComplete = (): void => {
        setTimeout(() => {
            NProgress.done();
        }, 200);
    };
    React.useEffect(() => {
        // get current route
        router.events.on('routeChangeStart', onRouterChangeStart);
        router.events.on('routeChangeComplete', onRouterChangeComplete);
        router.events.on('routeChangeError', onRouterChangeComplete);
        return () => {
            router.events.off('routeChangeStart', onRouterChangeStart);
            router.events.off('routeChangeComplete', onRouterChangeComplete);
            router.events.off('routeChangeError', onRouterChangeComplete);
        };
    }, [router.events]);

    React.useEffect(() => {
        HTTP_DEFAULT_HEADERS['csrf-token'] = csrfToken || '';
    }, [csrfToken]);

    const isOnAdmin = router.asPath.startsWith('/admin');
    React.useEffect(() => {
        document.body.className = isOnAdmin ? 'admin' : '';
    });

    return (
        <>
            <Head>
                <title>Clap!</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            <TooltipProvider delayDuration={0}>
                <TranslationContextProvider language={currentLocale} locales={locales}>
                    <UserContextProvider initialUser={user}>
                        <QueryClientProvider client={queryClient}>
                            <TopNavBar />
                            {isOnAdmin && <AdminDrawer />}
                            <main>
                                <Component {...pageProps} />
                            </main>
                            <BottomNavBar />
                        </QueryClientProvider>
                    </UserContextProvider>
                </TranslationContextProvider>
            </TooltipProvider>
            <Toasts />
        </>
    );
};

MyApp.getInitialProps = async (appContext: AppContext): Promise<AppInitialProps & MyAppOwnProps> => {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);
    return { ...appProps, ...getInitialData(appContext.ctx) };
};

export default MyApp;
