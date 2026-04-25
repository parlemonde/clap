import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { getLocalesForLanguage, revalidateLocalesCacheTag } from '@server/i18n/server';

const LOCALE_REGEX = /^\w\w(\.json)?$/;

export async function GET(_request: NextRequest, props: { params: Promise<{ languageCode: string }> }) {
    const params = await props.params;
    await getCurrentUser();
    const value = params.languageCode;

    // Only allow language codes that match the regex
    if (!LOCALE_REGEX.test(value)) {
        return new NextResponse('Error 404, not found.', {
            status: 404,
        });
    }

    // Check if the language exists
    const values = value.split('.');
    const language = await db.query.languages.findFirst({
        where: eq(languages.value, values[0]),
    });
    if (!language) {
        return new NextResponse('Error 404, not found.', {
            status: 404,
        });
    }

    const locales = await getLocalesForLanguage(language.value);
    return NextResponse.json(locales);
}

export async function PUT(request: NextRequest, props: { params: Promise<{ languageCode: string }> }) {
    const params = await props.params;
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return new NextResponse('Error 403, forbidden.', {
            status: 403,
        });
    }

    const value = params.languageCode;
    // Only allow language codes that match the regex
    if (!LOCALE_REGEX.test(value)) {
        return new NextResponse('Error 404, not found.', {
            status: 404,
        });
    }

    // Check if the language exists
    const values = value.split('.');
    const language = await db.query.languages.findFirst({
        where: eq(languages.value, values[0]),
    });
    if (!language) {
        return new NextResponse('Error 404, not found.', {
            status: 404,
        });
    }

    try {
        const formData = await request.formData();
        const file: FormDataEntryValue | undefined = formData.getAll('language')[0];

        if (!file || !(file instanceof File) || !file.name.endsWith('.json')) {
            return new NextResponse('Error 400, no file found in request', {
                status: 400,
            });
        }

        // Image is over 4MB
        if (file.size > 4 * 1024 * 1024) {
            return new NextResponse('Error 400, file size is too large', {
                status: 400,
            });
        }

        const newTranslations = JSON.parse(await file.text());
        await db
            .update(languages)
            .set({
                locales: newTranslations,
            })
            .where(eq(languages.value, language.value));
        revalidateLocalesCacheTag(language.value);

        return new Response(null, {
            status: 204,
        });
    } catch (error) {
        console.error(error);
        return new NextResponse('Error 500, unknown error happened', {
            status: 500,
        });
    }
}
