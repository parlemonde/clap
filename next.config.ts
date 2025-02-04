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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        config.module.rules.push({
            test: /\.(html|txt)$/,
            use: ['raw-loader'],
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
                '*.html': {
                    loaders: ['raw-loader'],
                    as: '*.js',
                },
                '*.txt': {
                    loaders: ['raw-loader'],
                    as: '*.js',
                },
            },
        },
    },
    sassOptions: {
        includePaths: [path.join('src', 'styles')],
    },
    images: {
        loader: 'custom',
        loaderFile: './src/image-loader.js',
    },
};

export default nextConfig;
