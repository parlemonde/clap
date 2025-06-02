import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { jsonToPo } from './json-to-po';
import { poToJson } from './po-to-json';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getLocalesForLanguage } from 'src/actions/get-locales';
import { setDynamoDBItem } from 'src/aws/dynamoDb';
import { db } from 'src/database';
import { languages } from 'src/database/schemas/languages';

const LOCALE_REGEX = /^\w\w(\.(po|json))?$/;

export async function GET(_request: NextRequest, props: { params: Promise<{ languageCode: string }> }) {
    const params = await props.params;
    const user = await getCurrentUser();
    const value = params.languageCode;

    // Only allow language codes that match the regex
    if (!LOCALE_REGEX.test(value) || (value.endsWith('.po') && user?.role !== 'admin')) {
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

    const extension = values.length > 1 ? values[1] : 'json';
    if (extension === 'po') {
        const poFile = await jsonToPo(language.value, await getLocalesForLanguage(language.value));
        return new Response(poFile, {
            headers: {
                'Content-Type': 'text/x-gettext-translation',
                'Content-Length': poFile.length.toString(),
                'Content-Disposition': `attachment; filename="${language.value}.po"`,
            },
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

        if (!file || !(file instanceof File) || (!file.name.endsWith('.po') && !file.name.endsWith('.json'))) {
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

        const newTranslations = file.name.endsWith('.po') ? await poToJson(Buffer.from(await file.arrayBuffer())) : JSON.parse(await file.text());
        await setDynamoDBItem(`locales:${language.value}`, newTranslations);

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
