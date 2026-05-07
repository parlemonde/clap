'use server';

import { getCurrentUser } from '@server/auth/get-current-user';
import { deleteFile } from '@server/file-upload/file-upload';
import { logger } from '@server/logger';

export async function deleteImage(imageUrl: string, isAdmin: boolean = false): Promise<void> {
    if (!imageUrl.startsWith('/media/images/')) {
        return;
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return;
    }

    const userImageId = currentUser.role === 'student' ? currentUser.teacherId : currentUser.id;
    if (
        imageUrl.startsWith(`/media/images/users/${userImageId}/`) || // user images can be deleted by the user themselves
        (currentUser.role === 'admin' && isAdmin) // admins can delete admin images
    ) {
        try {
            await deleteFile(imageUrl.slice(1)); // remove the leading slash
        } catch (e) {
            logger.error(e);
        }
    }
}
