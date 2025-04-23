'use client';

import { getS3UploadParameters } from 'src/aws/s3';

export async function uploadSound(file: File): Promise<string> {
    const formData = new FormData();

    const s3UploadParameters = await getS3UploadParameters(file.name);

    if (s3UploadParameters) {
        const { formParameters, s3Url } = s3UploadParameters;
        for (const [key, value] of Object.entries(formParameters)) {
            formData.append(key, value);
        }
        formData.append('file', file);
        const key = formParameters.key;
        if (!key) {
            throw new Error('Failed to upload sound');
        }
        const response = await fetch(s3Url, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload sound');
        }
        return `/static/${key}`;
    } else {
        formData.append('file', file);
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
}
