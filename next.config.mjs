/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
    poweredByHeader: false,
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
};

export default nextConfig;
