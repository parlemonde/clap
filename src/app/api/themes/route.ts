import { NextResponse } from 'next/server';

import { getCurrentUser } from '@server-actions/get-current-user';
import { listThemes } from '@server-actions/themes/list-themes';

export const dynamic = 'force-dynamic';

export async function GET() {
    const user = await getCurrentUser();
    const themes = await listThemes({
        userId: user?.id,
    });
    return NextResponse.json(themes);
}
