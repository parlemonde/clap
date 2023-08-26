/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});
const withPWA = require('next-pwa');
const path = require('path');

module.exports = withBundleAnalyzer(
    withPWA({
        distDir: './dist/next',
        poweredByHeader: false,
        webpack: (config) => {
            config.module.rules.push({
                test: /\.svg$/,
                issuer: /\.[jt]sx?$/,
                use: ['@svgr/webpack'],
            });
            return config;
        },
        experimental: { esmExternals: false },
        eslint: {
            // ESLint is already called before building with nextJS. So no need here.
            ignoreDuringBuilds: true,
        },
        pwa: {
            disable: process.env.NODE_ENV !== 'production',
        },
        sassOptions: {
            includePaths: [path.join(__dirname, 'src', 'styles')],
        },
    }),
);
