import type { Readable } from 'stream';

import type { Image } from '../entities/image';
import { LocalUtils } from './local';
import type { FileData, Provider } from './provider';
import { AwsS3 } from './s3';

const STOCKAGE_PROVIDER: string = process.env.STOCKAGE_PROVIDER_NAME || 'local';

const providers: { [p: string]: Provider } = {
    local: new LocalUtils(),
    s3: new AwsS3(),
};

export async function uploadImage(filename: string, filePath: string): Promise<string | null> {
    if (providers[STOCKAGE_PROVIDER] === undefined) {
        return null;
    } else {
        return await providers[STOCKAGE_PROVIDER].uploadImage(filename, filePath);
    }
}

export async function deleteImage(image: Image): Promise<void> {
    if (providers[STOCKAGE_PROVIDER] !== undefined) {
        return await providers[STOCKAGE_PROVIDER].deleteImage(image.uuid, image.localPath);
    }
}

export async function uploadFile(filename: string, filedata: Buffer): Promise<void> {
    if (providers[STOCKAGE_PROVIDER] === undefined) {
        return;
    } else {
        return await providers[STOCKAGE_PROVIDER].uploadFile(filename, filedata);
    }
}

export async function downloadFile(filename: string): Promise<Buffer | null> {
    if (providers[STOCKAGE_PROVIDER] === undefined) {
        return null;
    } else {
        return await providers[STOCKAGE_PROVIDER].getFile(filename);
    }
}

export async function getFileData(filename: string): Promise<FileData | null> {
    if (providers[STOCKAGE_PROVIDER] === undefined) {
        return null;
    } else {
        return await providers[STOCKAGE_PROVIDER].getFileData(filename);
    }
}
export async function getFile(filename: string, range?: string): Promise<Readable | null> {
    if (providers[STOCKAGE_PROVIDER] === undefined) {
        return null;
    } else {
        return await providers[STOCKAGE_PROVIDER].streamFile(filename, range);
    }
}
