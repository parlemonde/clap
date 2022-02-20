/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const withPWA = require('next-pwa');

module.exports = withPWA({
    distDir: './dist/next',
    poweredByHeader: false,
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
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
});
