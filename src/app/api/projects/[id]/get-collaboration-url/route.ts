import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentUser } from 'src/actions/get-current-user';
import { buf2hex, hmac } from 'src/aws/utils';

async function getCollaborationWebsocketUrl(room: string) {
    const secretKey = `secret:${process.env.APP_SECRET}`;
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const dateKey = await hmac(secretKey, date);
    const roomKey = await hmac(dateKey, room);
    const signature = buf2hex(roomKey);
    return `${process.env.COLLABORATION_SERVER_URL}?room=${encodeURIComponent(room)}&date=${encodeURIComponent(date)}&signature=${encodeURIComponent(signature)}`;
}

const getProjectRoom = (projectId: number) => `clap_project_${projectId}`;

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const projectId = Number(params.id) || 0;
    const user = await getCurrentUser();

    if (!user || (user.role === 'student' && user.projectId !== projectId)) {
        return new NextResponse('Error 401, unauthorized.', {
            status: 401,
        });
    }

    return NextResponse.json({
        url: await getCollaborationWebsocketUrl(getProjectRoom(projectId)),
    });
}
