import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { v4 } from 'uuid';

import { uploadFile } from 'src/actions/files/file-upload';
import { getCurrentUser } from 'src/actions/get-current-user';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        const formData = await request.formData();
        const file: FormDataEntryValue | undefined = formData.getAll('image')[0];
        const isAdminImage = formData.getAll('isAdminImage')[0] === 'true';

        if (isAdminImage && currentUser?.role !== 'admin') {
            return new NextResponse('Unauthorized', {
                status: 401,
            });
        }

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

        const userImageId = currentUser?.role === 'student' ? currentUser.teacherId : currentUser?.id;
        const fileName = isAdminImage
            ? `media/images/${uuid}.webp`
            : userImageId !== undefined
              ? `media/images/users/${userImageId}/${uuid}.webp`
              : `media/images/tmp/${uuid}.webp`;
        await uploadFile(fileName, imageBuffer, 'image/webp');
        return Response.json({ url: `/${fileName}` });
    } catch {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
