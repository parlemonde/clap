import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { listQuestions } from 'src/actions/questions/list-questions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const scenarioIdStr = searchParams.get('scenarioId');
    const scenarioId = Number(scenarioIdStr);
    if (!scenarioId || isNaN(scenarioId)) {
        return NextResponse.json([]);
    }

    const cookieStore = await cookies();
    const currentLocale = cookieStore.get('app-language')?.value || 'fr';
    const questions = await listQuestions(scenarioId, currentLocale);
    return NextResponse.json(questions);
}
