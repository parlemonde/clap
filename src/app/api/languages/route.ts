import { NextResponse } from 'next/server';

import { db } from '@server/database';

export const dynamic = 'force-dynamic';

export async function GET() {
    const languages = await db.query.languages.findMany();
    return NextResponse.json(languages);
}
