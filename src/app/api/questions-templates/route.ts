import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { listQuestionsTemplates } from 'src/actions/questions-templates/list-questions-templates';

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
    const questions = await listQuestionsTemplates(scenarioId, currentLocale);
    return NextResponse.json(questions);
}
