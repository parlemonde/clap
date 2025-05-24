'use server';

import { getCurrentUser } from '../get-current-user';
import { deleteFile } from 'src/actions/files/file-upload';

export async function deleteImage(imageUrl: string, isAdmin: boolean = false): Promise<void> {
    if (!imageUrl.startsWith('/api/images/')) {
        return;
    }

    const currentUser = await getCurrentUser();
    const userImageId = currentUser?.role === 'student' ? currentUser.teacherId : currentUser?.id;
    if (
        (!currentUser && imageUrl.startsWith('/api/images/temp/')) || // temp images can be deleted by anyone
        (currentUser && imageUrl.startsWith(`/api/images/users/${userImageId}/`)) || // user images can be deleted by the user themselves
        (currentUser?.role === 'admin' && isAdmin) // admins can delete admin images
    ) {
        try {
            await deleteFile(imageUrl.slice('/api/'.length));
        } catch {
            // do nothing
        }
    }
}
