import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';
import { v4 } from 'uuid';

import { uploadFile } from 'src/fileUpload';

const AVAILABLE_IMAGE_FORMATS = ['jpeg', 'png', 'gif', 'svg', 'webp'] as const;
type ImageFormat = typeof AVAILABLE_IMAGE_FORMATS[number];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file: FormDataEntryValue | undefined = formData.getAll('image')[0];

        if (!file || !(file instanceof File)) {
            return new NextResponse('No file found in request', {
                status: 400,
            });
        }

        // Image is over 100MB
        if (file.size > 100 * 1024 * 1024) {
            return new NextResponse('File size is too large', {
                status: 400,
            });
        }

        const uuid = v4();
        let extension = path.extname(file.name).substring(1);
        const needReFormat = !(AVAILABLE_IMAGE_FORMATS as readonly string[]).includes(extension);
        if (needReFormat) {
            extension = 'jpeg';
        }
        const filename = `${uuid}.${extension}`;
        const fileBuffer = await file.arrayBuffer();

        // - Resize image if needed to max width: 1920.
        // - Use `.rotate()` to keep original image orientation metadata.
        const sharpPipeline = sharp(fileBuffer)
            .rotate()
            .resize(1920, null, {
                withoutEnlargement: true,
            })
            .toFormat(extension as ImageFormat);
        const imageBuffer = await sharpPipeline.toBuffer();

        const url = await uploadFile('images', filename, imageBuffer);
        return Response.json({ url });
    } catch (error) {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
