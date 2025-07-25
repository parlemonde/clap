import { NextResponse } from 'next/server';

import { db } from 'src/database';

export const dynamic = 'force-dynamic';

export async function GET() {
    const languages = await db.query.languages.findMany();
    return NextResponse.json(languages);
}
