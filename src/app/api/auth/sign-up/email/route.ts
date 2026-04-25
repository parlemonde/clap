import { eq, and } from 'drizzle-orm';
import { type NextRequest } from 'next/server';
import { createLoader, parseAsString } from 'nuqs/server';

import { auth } from '@server/auth/auth';
import { isInviteTokenValid } from '@server/auth/invite-token';
import { db } from '@server/database';
import { auth_verifications as authVerifications } from '@server/database/schemas/auth-schemas';

const getStringValue = (value: FormDataEntryValue | null): string => {
    if (typeof value === 'string') {
        return value;
    }
    return '';
};

const signUpParams = {
    inviteToken: parseAsString.withDefault(''),
};
const loadSearchParams = createLoader(signUpParams);
export const POST = async (request: NextRequest) => {
    const { inviteToken } = loadSearchParams(request.nextUrl.searchParams);
    if (!(await isInviteTokenValid(inviteToken))) {
        return new Response(null, { status: 401 });
    }

    const formData = await request.formData();
    const email = getStringValue(formData.get('email'));
    const name = getStringValue(formData.get('name'));
    const password = getStringValue(formData.get('password'));

    const response = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        },
        asResponse: true,
    });

    // Delete the invite token
    try {
        await db.delete(authVerifications).where(and(eq(authVerifications.identifier, 'invite-token'), eq(authVerifications.value, inviteToken)));
    } catch (error) {
        console.error(error);
    }

    return response;
};
