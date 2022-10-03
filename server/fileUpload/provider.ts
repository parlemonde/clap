export abstract class Provider {
    public abstract uploadImage(filename: string, filePath: string, hasMultipleSizes?: boolean): Promise<string>;
    public abstract deleteImage(filename: string, filePath: string): Promise<void>;
    public abstract getFile(filename: string): Promise<Buffer | null>;
    public abstract uploadFile(filename: string, filedata: Buffer): Promise<void>;
    public abstract uploadSound(filename: string, filePath: string): Promise<string>;
}
