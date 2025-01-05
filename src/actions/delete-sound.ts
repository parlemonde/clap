'use server';

import { deleteFile } from 'src/fileUpload';

export async function deleteSound(soundUrl: string): Promise<void> {
    if (!soundUrl.startsWith('/api/audios/')) {
        return;
    }
    const url = soundUrl.slice('/api/audios/'.length);
    try {
        await deleteFile('audios', url, false);
    } catch {
        // do nothing
    }
}
