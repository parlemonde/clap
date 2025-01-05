'use client';

export async function uploadSound(file: File | Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch('/api/audios', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to upload sound');
    }
    const { url } = (await response.json()) as { url: string };
    return url;
}
