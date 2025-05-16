import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { v4 } from 'uuid';

import { awsClient } from './aws-client';
import { getFiles } from './get-files';
import { setCompleted, setProgress, startProgress } from './progress';
import { throttle } from './throttle';
import { isObjectLiteral, isString, isFile } from './types';

function updateProgress(data: unknown, videoId: string, dynamoDbTable: string) {
    if (typeof data !== 'string') {
        return;
    }
    const maybeProgress = data.includes('percentage')
        ? Number(
              data
                  .split(':')
                  .map((s) => s.trim())
                  .slice(-1),
          )
        : undefined;
    if (maybeProgress !== undefined && !isNaN(maybeProgress)) {
        const percentage = Math.min(99, Math.max(1, Math.round(maybeProgress)));
        setProgress(videoId, dynamoDbTable, percentage).catch(console.error);
    } else {
        console.warn(data);
    }
}
const updateProgressThrottled = throttle(updateProgress, 100);

export async function handler(event: unknown) {
    const payload = isObjectLiteral(event) ? event : {};
    const mlt = isString(payload.mlt) ? payload.mlt : '';
    const s3Files = Array.isArray(payload.s3Files) ? payload.s3Files.filter(isFile) : [];
    const httpFiles = Array.isArray(payload.httpFiles) ? payload.httpFiles.filter(isFile) : [];
    const s3BucketName = isString(payload.s3BucketName) ? payload.s3BucketName : '';
    const s3Region = isString(payload.s3Region) ? payload.s3Region : process.env.AWS_REGION;
    const s3Key = isString(payload.s3Key) ? payload.s3Key : '';
    const dynamoDbTable = isString(payload.dynamoDbTable) ? payload.dynamoDbTable : '';
    const videoId = isString(payload.videoId) ? payload.videoId : '';

    if (!mlt || !s3BucketName || !s3Region || !s3Key || !videoId || !dynamoDbTable) {
        return {
            success: false,
            error: 'Missing required parameters. (one of: mlt, s3BucketName, s3Region, s3Key, videoId, dynamoDbTable)',
        };
    }

    try {
        await startProgress(videoId, dynamoDbTable, mlt, s3Key);

        const id = v4();
        const dir = path.join('/tmp', 'montage', id);
        await fs.ensureDir(dir);

        // 1 - Download files
        await getFiles(dir, s3Files, httpFiles);

        // 2 - Save MLT file
        const mltFilePath = path.join(dir, 'montage.mlt');
        await fs.writeFile(mltFilePath, mlt);

        // 3 - Generate video
        const outputFilePath = path.join(dir, 'output.mp4');
        await new Promise<void>((resolve) => {
            const child = spawn('dumb-init', [
                '--',
                'xvfb-run',
                '-a',
                'melt',
                mltFilePath,
                '-consumer',
                `avformat:${outputFilePath}`,
                'vcodec=libx264',
                'f=mp4',
                'movflags=frag_keyframe',
                'use_wallclock_as_timestamps=1',
            ]);
            child.stderr.setEncoding('utf-8');
            child.stdout.setEncoding('utf-8');
            child.stderr.on('data', (d) => {
                updateProgressThrottled(d, videoId, dynamoDbTable);
            });
            child.on('close', resolve);
            child.on('error', (...args) => {
                console.error('Error generating video:', args);
                resolve();
            });
        });

        // 4 - Upload video to s3
        const s3BaseUrl = `https://${s3BucketName}.s3.${s3Region}.amazonaws.com`;
        const filename = s3Key.endsWith('.mp4') ? s3Key : `${s3Key}.mp4`;
        const key = `${s3BaseUrl}/${filename}`;
        await awsClient.fetch(key, {
            method: 'PUT',
            body: fs.readFileSync(outputFilePath),
            headers: {
                'Content-Length': fs.statSync(outputFilePath).size.toString(),
                'Content-Type': 'video/mp4',
            },
        });

        // 5 - Remove temp files
        await fs.remove(dir);

        // 6 - Set video as completed
        await setCompleted(videoId, dynamoDbTable, true);

        return {
            success: true,
        };
    } catch (e) {
        console.error('Error generating video:', e);
        await setCompleted(videoId, dynamoDbTable, false);
        return {
            success: false,
        };
    }
}
