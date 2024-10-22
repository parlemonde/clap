import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    poweredByHeader: false,
    webpack: (config) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        return config;
    },
    experimental: {
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
        },
    },
    sassOptions: {
        includePaths: [path.join('src', 'styles')],
        silenceDeprecations: ['legacy-js-api'],
    },
    images: {
        loader: 'custom',
        loaderFile: './src/image-loader.js',
    },
};

export default nextConfig;
