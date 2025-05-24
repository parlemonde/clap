import { installDependencies } from '@opennextjs/aws/build/installDeps.js';
import fs from 'node:fs';

// Remove broken sharp symlink first.
fs.rmSync('.open-next/server-functions/default/node_modules/sharp', { recursive: true, force: true });

installDependencies('.open-next/server-functions/default', {
    packages: ['sharp@0.34.2', '@node-rs/argon2@2.0.2'],
    // additionalArgs: '--platform=linux --os=linux --arch=arm64 --cpu=arm64 --libc=glibc',
});
