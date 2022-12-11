import 'nprogress/nprogress.css';
import 'react-html5-camera-photo/build/css/index.css';

import 'src/styles/fonts.css';
import 'src/styles/globals.css';

import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/react';
import axios from 'axios';
import App from 'next/app';
import type { AppProps, AppInitialProps, AppContext } from 'next/app';
import Head from 'next/head';
import { SnackbarProvider } from 'notistack';
import NProgress from 'nprogress';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { AdminDrawer } from 'src/components/admin/AdminDrawer';
import { Flex } from 'src/components/layout/Flex';
import { BottomNavBar } from 'src/components/navigation/BottomNavBar';
import { TopNavBar } from 'src/components/navigation/TopNavBar';
import { ProjectContextProvider } from 'src/contexts/projectContext';
import { UserContextProvider } from 'src/contexts/userContext';
import { TranslationContextProvider } from 'src/i18n/useTranslation';
import createEmotionCache from 'src/styles/createEmotionCache';
import theme from 'src/styles/theme';
import { getInitialData } from 'src/utils/data';
import type { User } from 'types/models/user.type';

interface MyAppOwnProps {
    locales: Record<string, string>;
    currentLocale: string;
    csrfToken: string | null;
    user: User | null;
}
type MyAppProps = AppProps &
    MyAppOwnProps & {
        emotionCache: EmotionCache;
    };

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 3600000, // 1 hour
        },
    },
});

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const MyApp: React.FunctionComponent<MyAppProps> & {
    getInitialProps(appContext: AppContext): Promise<AppInitialProps>;
} = ({ Component, pageProps, router, user, csrfToken, currentLocale, locales, emotionCache = clientSideEmotionCache }: MyAppProps) => {
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
        axios.defaults.headers.common['csrf-token'] = csrfToken || '';
    }, [csrfToken]);

    const isOnAdmin = router.pathname.slice(1, 6) === 'admin';

    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <title>Clap!</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            <TranslationContextProvider language={currentLocale} locales={locales}>
                <UserContextProvider initialUser={user}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <SnackbarProvider
                            maxSnack={3}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                        >
                            <QueryClientProvider client={queryClient}>
                                {isOnAdmin ? (
                                    <div style={{ minHeight: '100vh', backgroundColor: '#eee' }}>
                                        <TopNavBar />
                                        <Flex isFullWidth flexDirection="row" alignItems="flex-start">
                                            <AdminDrawer />
                                            <Container component={'main'} maxWidth="xl">
                                                <Component {...pageProps} />
                                            </Container>
                                        </Flex>
                                    </div>
                                ) : (
                                    <ProjectContextProvider>
                                        <TopNavBar />
                                        <Container component={'main'} maxWidth="lg">
                                            <Component {...pageProps} />
                                        </Container>
                                        <BottomNavBar />
                                    </ProjectContextProvider>
                                )}
                            </QueryClientProvider>
                        </SnackbarProvider>
                    </ThemeProvider>
                </UserContextProvider>
            </TranslationContextProvider>
        </CacheProvider>
    );
};

MyApp.getInitialProps = async (appContext: AppContext): Promise<AppInitialProps & MyAppOwnProps> => {
    // calls page's `getInitialProps` and fills `appProps.pageProps`
    const appProps = await App.getInitialProps(appContext);
    return { ...appProps, ...getInitialData(appContext.ctx) };
};

export default MyApp;
