import { NextResponse } from 'next/server';

import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';

export const dynamic = 'force-dynamic';

export async function GET() {
    const availableLanguages = await db.select({ value: languages.value, label: languages.label }).from(languages);
    return NextResponse.json(availableLanguages);
}
