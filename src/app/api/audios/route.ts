import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 } from 'uuid';

import { uploadFile } from 'src/actions/files/file-upload';
import { getCurrentUser } from 'src/actions/get-current-user';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        const formData = await request.formData();
        const file: FormDataEntryValue | undefined = formData.getAll('file')[0];

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
        const fileName = currentUser ? `audios/users/${currentUser?.id}/${uuid}.${extension}` : `audios/temp/${uuid}.${extension}`;
        const contentType = mime.lookup(fileName) || undefined;
        await uploadFile(fileName, Buffer.from(await file.arrayBuffer()), contentType);
        return Response.json({ url: `/static/${fileName}` });
    } catch {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
