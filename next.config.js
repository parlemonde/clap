/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require('path');

module.exports = {
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
    // experimental: { esmExternals: false },
    eslint: {
        // ESLint is already called before building with nextJS. So no need here.
        ignoreDuringBuilds: true,
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'src', 'styles')],
    },
};
