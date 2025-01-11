import { and, eq } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';

import { getCurrentUser } from 'src/actions/get-current-user';
import { db } from 'src/database';
import { projects } from 'src/database/schemas/projects';

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const projectId = params.id;
    const user = await getCurrentUser();

    if (!user) {
        return new NextResponse('Error 401, unauthorized.', {
            status: 401,
        });
    }

    const userId = user.id;
    const project = /^\d+$/.test(params.id)
        ? await db.query.projects.findFirst({
              where:
                  user.role === 'admin' ? eq(projects.id, Number(projectId)) : and(eq(projects.id, Number(projectId)), eq(projects.userId, userId)),
          })
        : undefined;
    if (!project) {
        return new NextResponse('Error 404, not found.', {
            status: 404,
        });
    }
    return NextResponse.json(project);
}
