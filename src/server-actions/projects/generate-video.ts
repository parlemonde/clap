'use server';

import { v4 } from 'uuid';

import { getCurrentUser } from '@server/auth/get-current-user';
import { invokeLambda } from '@server/aws/lambda';
import { getS3FileUrl } from '@server/aws/s3';
import type { ProjectData } from '@server/database/schemas/projects';
import { logger } from '@server/logger';

import { projectToMlt } from './project-to-mlt';

export async function generateVideo(
    project: ProjectData,
    name: string,
    _projectId?: number,
): Promise<{
    percentage: number;
    url: string;
} | null> {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    try {
        const { mltStr, files } = await projectToMlt(project, name, 'local');
        const currentProgress = 0;
        const jobId = v4();
        const s3Key = `media/videos/${jobId}/video.mp4`;
        const s3Files = files
            .filter((f) => f.isLocal)
            .map((f) => ({
                name: f.fileName,
                path: getS3FileUrl(f.fileUrl),
            }));
        const httpFiles = files
            .filter((f) => !f.isLocal)
            .map((f) => ({
                name: f.fileName,
                path: f.fileUrl,
            }));
        await invokeLambda(
            {
                kind: 'video',
                payload: {
                    mlt: mltStr,
                    s3Files,
                    httpFiles,
                    s3BucketName: process.env.S3_BUCKET_NAME || '',
                    s3Key,
                },
            },
            true, // Async
        );
        return {
            percentage: currentProgress,
            url: '',
        };
    } catch (e) {
        logger.error(e);
        return null;
    }
}

export async function getVideoProgress(_projectId?: number): Promise<{
    percentage: number;
    url: string;
} | null> {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    try {
        const currentProgress = 0;
        return {
            percentage: currentProgress,
            url: '',
        };
    } catch (e) {
        logger.error(e);
        return null;
    }
    return null;
}
