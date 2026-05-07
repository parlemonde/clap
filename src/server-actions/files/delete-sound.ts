'use server';

import { getCurrentUser } from '@server/auth/get-current-user';
import { deleteFile } from '@server/file-upload/file-upload';

export async function deleteSound(soundUrl: string): Promise<void> {
    if (!soundUrl.startsWith('/media/audios/')) {
        return;
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return;
    }

    const userAudioId = currentUser.role === 'student' ? currentUser.teacherId : currentUser.id;
    if (soundUrl.startsWith(`/media/audios/users/${userAudioId}/`)) {
        try {
            await deleteFile(soundUrl.slice(1)); // remove the leading slash
        } catch {
            // do nothing
        }
    }
}
