'use server';

import { v4 } from 'uuid';

import { getCurrentUser } from '../get-current-user';
import { projectToMlt } from './project-to-mlt';
import { getDynamoDBItem, setDynamoDBItem } from 'src/aws/dynamoDb';
import { invokeLambda } from 'src/aws/lambda';
import { deleteS3File, getS3FileUrl } from 'src/aws/s3';
import type { ProjectData } from 'src/database/schemas/projects';

// From server-video-generation
interface VideoProgress {
    percentage: number;
    mlt: string;
    s3Key: string;
    status: 'processing' | 'completed' | 'failed';
    expiresAt?: number;
}

export async function generateVideo(
    project: ProjectData,
    name: string,
    projectId?: number,
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
        const videoKey = projectId ? `projects/${projectId}` : `projects/tmp-for-${user.id}`;
        const currentProgress = await getDynamoDBItem<VideoProgress>(videoKey);
        const currentDate = new Date().getTime();
        if (
            currentProgress &&
            currentProgress.mlt === mltStr &&
            (!currentProgress.expiresAt || currentProgress.expiresAt > currentDate) &&
            currentProgress.status !== 'failed'
        ) {
            return {
                percentage: currentProgress.percentage,
                url: currentProgress.percentage === 100 ? `/static/${currentProgress.s3Key}` : '',
            };
        }
        await setDynamoDBItem(videoKey, undefined); // delete old progress
        if (currentProgress && currentProgress.s3Key) {
            try {
                await deleteS3File(currentProgress.s3Key); // delete old video
            } catch (e) {
                console.error(e);
            }
        }
        const jobId = v4();
        const s3Key = `videos/${jobId}/video.mp4`;
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
                    dynamoDbTable: process.env.DYNAMODB_TABLE_NAME || '',
                    videoId: videoKey,
                },
            },
            true, // Async
        );
        return {
            percentage: 0,
            url: '',
        };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getVideoProgress(projectId?: number): Promise<{
    percentage: number;
    url: string;
} | null> {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    try {
        const videoKey = projectId ? `projects/${projectId}` : `projects/tmp-for-${user.id}`;
        const currentProgress = await getDynamoDBItem<VideoProgress>(videoKey);
        if (currentProgress) {
            return {
                percentage: currentProgress.percentage,
                url: currentProgress.percentage === 100 ? `/static/${currentProgress.s3Key}` : '',
            };
        } else {
            // Video might be in queue to be processed. So we return 0% progress.
            return {
                percentage: 0,
                url: '',
            };
        }
    } catch {
        // Ignore
    }
    return null;
}
