import type { S3 } from 'aws-sdk';
import AWS from 'aws-sdk';
import fs from 'fs-extra';
import path from 'path';

import { logger } from '../utils/logger';
import { Provider } from './provider';

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'clap_bucket';
const IS_MINIO = process.env.S3_ENDPOINT === 'minio:9000';

const publicPolicy = (folderName: string): { Version: string; Statement: [{ [key: string]: string | string[] }] } => ({
    Statement: [
        {
            Action: ['s3:GetObject'],
            Effect: 'Allow',
            Principal: '*',
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/${folderName}/*`],
            Sid: 'PublicRead',
        },
    ],
    Version: '2012-10-17',
});

export class AwsS3 extends Provider {
    private s3: S3;

    private addPublicReadPolicy(folderName: string): void {
        this.s3.putBucketPolicy(
            {
                Bucket: BUCKET_NAME,
                Policy: JSON.stringify(publicPolicy(folderName)),
            },
            (err2) => {
                if (err2) console.error(err2);
                else {
                    logger.info(`Successesfully create policy for folder ${folderName}`);
                }
            },
        );
    }

    private uploadS3File(filepath: string, file: Buffer | fs.ReadStream): Promise<string> {
        logger.info(filepath);
        return new Promise((resolve, reject) => {
            this.s3.upload(
                {
                    Body: file,
                    Bucket: BUCKET_NAME,
                    Key: filepath,
                },
                function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    if (data) {
                        resolve(data.Location);
                    }
                },
            );
        });
    }

    private deleteS3File(filepath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.s3.deleteObject(
                {
                    Bucket: BUCKET_NAME,
                    Key: filepath,
                },
                function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    if (data) {
                        resolve();
                    }
                },
            );
        });
    }

    private getS3File(filepath: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            this.s3.getObject(
                {
                    Bucket: BUCKET_NAME,
                    Key: filepath,
                },
                function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    if (data) {
                        if (data.Body instanceof Buffer) {
                            resolve(data.Body);
                        } else {
                            reject('Response is not a buffer...');
                        }
                    }
                },
            );
        });
    }

    constructor() {
        super();
        if (process.env.STOCKAGE_PROVIDER_NAME !== 's3' || !process.env.S3_BUCKET_NAME) {
            return;
        }

        this.s3 = new AWS.S3({
            accessKeyId: process.env.S3_ACCESS_KEY,
            s3ForcePathStyle: true,
            secretAccessKey: process.env.S3_SECRET_KEY,
            sslEnabled: process.env.S3_USE_SSL === 'true',
        });

        this.addPublicReadPolicy('images');
    }

    public async uploadImage(filename: string, filePath: string): Promise<string> {
        // local dir
        const dir: string = path.join(__dirname, '..', filePath);
        const fileStream = fs.createReadStream(`${dir}/${filename}.jpeg`);
        let url = '';

        // upload image on stockage server
        try {
            url = await this.uploadS3File(`images/${filename}.jpeg`, fileStream);
        } catch (e) {
            logger.error(e);
            logger.error(`File ${filename} could not be sent to aws !`);
            return '';
        }

        // delete local file
        try {
            await fs.remove(`${dir}/${filename}.jpeg`);
        } catch (e) {
            logger.error(`File ${filename} not found !`);
        }

        if (IS_MINIO) {
            return url.replace('minio', 'localhost');
        }
        return url;
    }

    public async deleteImage(filename: string): Promise<void> {
        try {
            await this.deleteS3File(`images/${filename}.jpeg`);
        } catch (e) {
            logger.error(`File ${filename} not found !`);
        }
    }

    public async getFile(filename: string): Promise<Buffer | null> {
        try {
            return await this.getS3File(`files/${filename}`);
        } catch (e) {
            console.error(e);
            logger.error(`File ${filename} not found !`);
        }
        return null;
    }

    public async uploadFile(filename: string, filedata: Buffer): Promise<void> {
        try {
            await this.uploadS3File(`files/${filename}`, filedata);
        } catch (e) {
            logger.error(`Error while uploading ${filename}.`);
        }
    }

    public async uploadSound(filename: string, filePath: string): Promise<string> {
        // local dir
        const dir: string = path.join(__dirname, '..', filePath);
        const fileStream = fs.createReadStream(`${dir}/${filename}.mp3`);
        let url = '';

        // upload image on stockage server
        try {
            url = await this.uploadS3File(`files/${filename}.mp3`, fileStream);
        } catch (e) {
            logger.error(e);
            logger.error(`File ${filename} could not be sent to aws !`);
            return '';
        }

        // delete local file
        try {
            await fs.remove(`${dir}/${filename}.mp3`);
        } catch (e) {
            logger.error(`File ${filename} not found !`);
        }

        if (IS_MINIO) {
            return url.replace('minio', 'localhost');
        }
        return url;
    }
}
