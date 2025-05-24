import type { OpenNextConfig } from '@opennextjs/aws/types/open-next.js';

const config: OpenNextConfig = {
    default: {
        override: {
            tagCache: 'dummy',
            queue: 'dummy',
            incrementalCache: 'dummy',
            wrapper: () => import('./customWrapper').then((mod) => mod.default),
        },
    },
    buildCommand: 'pnpm build',
};

export default config;
