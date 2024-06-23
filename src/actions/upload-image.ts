'use client';

export async function uploadImage(file: File | Blob): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to upload image');
    }
    const { url } = await response.json();
    return url;
}
