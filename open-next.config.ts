import type { OpenNextConfig } from '@opennextjs/aws/types/open-next.js';

const config: OpenNextConfig = {
    default: {
        install: {
            packages: ['sharp@0.33.5', '@node-rs/argon2@2.0.2'],
            additionalArgs: '--platform=linux --os=linux --arch=arm64 --cpu=arm64 --libc=glibc',
        },
        override: {
            tagCache: 'dummy',
            queue: 'dummy',
            incrementalCache: 'dummy',
            wrapper: () => import('./customWrapper').then((mod) => mod.default),
        },
    },
};

export default config;
