import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 } from 'uuid';

import { uploadFile } from 'src/fileUpload';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file: FormDataEntryValue | undefined = formData.getAll('audio')[0];

        if (!file || !(file instanceof File)) {
            return new NextResponse('No file found in request', {
                status: 400,
            });
        }

        // Audio is over 50MB
        if (file.size > 50 * 1024 * 1024) {
            return new NextResponse('File size is too large', {
                status: 400,
            });
        }

        const uuid = v4();
        const extension = path.extname(file.name).substring(1);
        const filename = `${uuid}.${extension}`;

        const contentType = mime.lookup(filename) || undefined;
        const url = await uploadFile('audios', filename, false, Buffer.from(await file.arrayBuffer()), contentType);
        return Response.json({ url });
    } catch {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
