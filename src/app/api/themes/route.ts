import { NextResponse } from 'next/server';

import { getCurrentUser } from '@server/auth/get-current-user';
import { listThemes } from '@server-actions/themes/list-themes';

export async function GET() {
    const user = await getCurrentUser();
    const themes = await listThemes({
        userId: user?.id,
    });
    return NextResponse.json(themes);
}
