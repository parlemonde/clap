import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { v4 } from 'uuid';

import { uploadFile } from 'src/fileUpload';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file: FormDataEntryValue | undefined = formData.getAll('image')[0];

        if (!file || !(file instanceof File)) {
            return new NextResponse('No file found in request', {
                status: 400,
            });
        }

        // Image is over 4MB
        if (file.size > 4 * 1024 * 1024) {
            return new NextResponse('File size is too large', {
                status: 400,
            });
        }

        const uuid = v4();
        const filename = `${uuid}.webp`;
        const fileBuffer = await file.arrayBuffer();

        // - Resize image if needed to max width: 3840. (4k resolution)
        // - Use `.rotate()` to keep original image orientation metadata.
        const sharpPipeline = sharp(fileBuffer)
            .rotate()
            .resize(3840, null, {
                withoutEnlargement: true,
            })
            .toFormat('webp');
        const imageBuffer = await sharpPipeline.toBuffer();

        const url = await uploadFile('images', filename, imageBuffer);
        return Response.json({ url });
    } catch (error) {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
