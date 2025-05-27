'use server';

import { getCurrentUser } from '../get-current-user';
import { deleteFile } from 'src/actions/files/file-upload';

export async function deleteSound(soundUrl: string): Promise<void> {
    if (!soundUrl.startsWith('/media/audios/')) {
        return;
    }

    const currentUser = await getCurrentUser();
    const userAudioId = currentUser?.role === 'student' ? currentUser.teacherId : currentUser?.id;
    if (
        (!currentUser && soundUrl.startsWith('/media/audios/tmp/')) || // temp images can be deleted by anyone
        (currentUser && soundUrl.startsWith(`/media/audios/users/${userAudioId}/`)) // user images can be deleted by the user themselves
    ) {
        try {
            await deleteFile(soundUrl.slice(1)); // remove the leading slash
        } catch {
            // do nothing
        }
    }
}
