'use server';

import sanitize from 'sanitize-filename';

import { getCurrentUser } from '../get-current-user';
import { projectToMlt } from './project-to-mlt';
import type { ProjectData } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';

const BUILD_SERVER_URL = process.env.BUILD_SERVER_URL;

interface MeltJob {
    id: string;
    createdAt: string;
    status: 'waiting' | 'processing' | 'succeeded' | 'failed';
    progress: number; // from 0 to 100%
    outputs?: Array<{
        url: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        duration?: number; // for videos and audios
    }>;
}

export interface VideoJob {
    id: string;
    progress: number;
    url?: string;
}

export async function createVideoJob(project: ProjectData, name: string): Promise<VideoJob | null> {
    const user = await getCurrentUser();
    if (!user || !BUILD_SERVER_URL) {
        return null;
    }

    const { mlt } = await projectToMlt(project, name, 'full');
    mlt.elements.push({
        name: 'consumer',
        attributes: {
            id: 'consumer0',
            target: `${sanitize(name.replace(/\s/g, '-')) || 'output'}.mp4`,
            // eslint-disable-next-line camelcase
            mlt_service: 'avformat',
            r: 25,
        },
    });
    try {
        const response = await jsonFetcher<MeltJob | null>(`${BUILD_SERVER_URL}/api/v1/melt`, {
            method: 'POST',
            body: JSON.stringify(mlt),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response) {
            return {
                id: response.id,
                progress: response.progress,
                url: response.outputs?.[0]?.url?.replace('/api/v1/melt/', '/api/videos/') || '',
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getVideoJob(jobId: string): Promise<VideoJob | null> {
    const user = await getCurrentUser();
    if (!user || !BUILD_SERVER_URL) {
        return null;
    }

    try {
        const response = await jsonFetcher<MeltJob | null>(`${BUILD_SERVER_URL}/api/v1/melt/${jobId}`);
        if (response) {
            return {
                id: response.id,
                progress: response.progress,
                url: response.outputs?.[0]?.url?.replace('/api/v1/melt/', '/api/videos/') || '',
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}
