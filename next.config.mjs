/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
    output: 'standalone',
    poweredByHeader: false,
    webpack: (config) => {
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
    },
    images: {
        loader: 'custom',
        loaderFile: './src/image-loader.js',
    },
};

export default nextConfig;
