import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getRequestLocale } from '@server/i18n/server';
import { listQuestions } from '@server-actions/questions/list-questions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const scenarioIdStr = searchParams.get('scenarioId');
    const scenarioId = Number(scenarioIdStr);
    if (!scenarioId || isNaN(scenarioId)) {
        return NextResponse.json([]);
    }

    const currentLocale = await getRequestLocale();
    const questions = await listQuestions(scenarioId, currentLocale);
    return NextResponse.json(questions);
}
