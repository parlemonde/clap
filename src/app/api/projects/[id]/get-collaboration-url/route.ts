import { createHmac } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentUser } from '@server/auth/get-current-user';

async function getCollaborationWebsocketUrlAndParams(room: string): Promise<{
    url: string;
    protocols: string[];
}> {
    const date = new Date().toISOString();
    const secretKey = `secret:${process.env.COLLABORATION_SERVER_SECRET}`;
    const dateKey = createHmac('sha256', secretKey).update(date).digest();
    const signature = createHmac('sha256', dateKey).update(room).digest('hex');
    return {
        url: `${process.env.COLLABORATION_SERVER_URL}?room=${encodeURIComponent(room)}&date=${encodeURIComponent(date)}`,
        protocols: ['json', `auth.${signature}`],
    };
}

const getProjectRoom = (projectId: number) => `clap_project_${projectId}`;

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const projectId = Number(params.id) || 0;
    const user = await getCurrentUser();

    if (!process.env.COLLABORATION_SERVER_SECRET || !process.env.COLLABORATION_SERVER_URL) {
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
