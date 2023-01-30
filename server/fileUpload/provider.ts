import type { Readable } from 'stream';

export type FileData = { AcceptRanges: string; LastModified: Date; ContentLength: number; ContentType: string };

export abstract class Provider {
    public abstract uploadImage(filename: string, filePath: string, hasMultipleSizes?: boolean): Promise<string>;
    public abstract deleteImage(filename: string, filePath: string): Promise<void>;
    public abstract getFile(filename: string, range?: string): Promise<Buffer | null>;
    public abstract uploadFile(filename: string, filedata: Buffer): Promise<void>;
    public abstract getFileData(filename: string): Promise<FileData | null>;
    public abstract streamFile(filename: string, range?: string): Promise<Readable | null>;
}
