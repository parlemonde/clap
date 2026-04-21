import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/server/i18n/request.ts');

const nextConfig: NextConfig = {
    experimental: {
        useCache: true,
    },
    poweredByHeader: false,
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        config.module.rules.push({
            test: /\.(html|txt|pug)$/,
            use: ['raw-loader'],
        });
        return config;
    },
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
            '*.html': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
            '*.txt': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
            '*.pug': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
        },
    },
    sassOptions: {
        includePaths: [path.join('src', 'styles')],
    },
    output: 'standalone',
    outputFileTracingExcludes: {
        '/*': ['./tmp/**/*'],
    },
    images: {
        loader: 'custom',
        loaderFile: './src/image-loader.js',
    },
};

export default withNextIntl(nextConfig);
