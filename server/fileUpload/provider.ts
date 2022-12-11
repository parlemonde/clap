import type { Readable } from 'stream';

export type FileData = { AcceptRanges: string; LastModified: Date; ContentLength: number; ContentType: string };

export interface FileStorageProvider {
    getFileData(fileUrl: string): Promise<FileData | null>;
    getFile(fileUrl: string, range?: string): Promise<Readable | null>;
    uploadFile(fileUrl: string, filedata: Buffer): Promise<void>;
    deleteFile(fileUrl: string): Promise<void>;
}
