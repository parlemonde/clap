'use server';

import { getCurrentUser } from '../get-current-user';
import { deleteFile } from 'src/actions/files/file-upload';

export async function deleteSound(soundUrl: string): Promise<void> {
    if (!soundUrl.startsWith('/static/audios/')) {
        return;
    }

    const currentUser = await getCurrentUser();
    const userAudioId = currentUser?.role === 'student' ? currentUser.teacherId : currentUser?.id;
    if (
        (!currentUser && soundUrl.startsWith('/static/audios/temp/')) || // temp images can be deleted by anyone
        (currentUser && soundUrl.startsWith(`/static/audios/users/${userAudioId}/`)) // user images can be deleted by the user themselves
    ) {
        try {
            await deleteFile(soundUrl.slice('/static/'.length));
        } catch {
            // do nothing
        }
    }
}
