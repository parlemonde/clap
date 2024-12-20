'use server';

import { deleteFile } from 'src/fileUpload';

export async function deleteImage(imageUrl: string, isAdmin: boolean = false): Promise<void> {
    if (!imageUrl.startsWith('/api/images/')) {
        return;
    }
    const url = imageUrl.slice('/api/images/'.length);
    try {
        await deleteFile('images', url, isAdmin);
    } catch {
        // do nothing
    }
}
