import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentUser } from '@server/auth/get-current-user';
import { hmacSha256, hmacSha256Hex } from '@server/crypto/hmac';
import { getEnvVariable } from '@server/get-env-variable';

async function getCollaborationWebsocketUrlAndParams(room: string): Promise<{
    url: string;
    protocols: string[];
}> {
    const date = new Date().toISOString();
    const secretKey = `secret:${getEnvVariable('COLLABORATION_SERVER_SECRET')}`;
    const dateKey = hmacSha256(secretKey, date);
    const signature = hmacSha256Hex(dateKey, room);
    return {
        url: `${getEnvVariable('COLLABORATION_SERVER_URL')}?room=${encodeURIComponent(room)}&date=${encodeURIComponent(date)}`,
        protocols: ['json', `auth.${signature}`],
    };
}

const getProjectRoom = (projectId: number) => `clap_project_${projectId}`;

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const projectId = Number(params.id) || 0;
    const user = await getCurrentUser();

    if (!getEnvVariable('COLLABORATION_SERVER_SECRET') || !getEnvVariable('COLLABORATION_SERVER_URL')) {
        return new NextResponse(null, { status: 500 });
    }

    if (!user || (user.role === 'student' && user.projectId !== projectId)) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    return NextResponse.json({
        ...(await getCollaborationWebsocketUrlAndParams(getProjectRoom(projectId))),
    });
}
