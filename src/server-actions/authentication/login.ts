/* eslint-disable camelcase */
'use server';

import { eq, and } from 'drizzle-orm';
import { redirect, RedirectType } from 'next/navigation';

import { auth } from '@server/auth/auth';
import { PARLEMONDE_SSO_PROVIDER_ID } from '@server/auth/parlemonde-sso-plugin';
import { db } from '@server/database';
import { auth_accounts } from '@server/database/schemas/auth-schemas';
import { users } from '@server/database/schemas/users';

import { getStringValue } from '@lib/get-string-value';

export async function login(_previousState: string, formData: FormData): Promise<string> {
    const email = getStringValue(formData.get('email'));
    const password = getStringValue(formData.get('password'));

    const ssoProvider = PARLEMONDE_SSO_PROVIDER_ID;
    const result = await db
        .select({
            providers: auth_accounts.providerId,
        })
        .from(auth_accounts)
        .leftJoin(users, eq(users.id, auth_accounts.userId))
        .where(and(eq(users.email, email)));
    if (result.some((r) => r.providers === ssoProvider) && result.every((r) => r.providers !== 'credential')) {
        return 'common.errors.sso_connection_required';
    }

    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            },
        });
    } catch {
        return 'common.errors.invalid_credentials';
    }
    redirect('/', RedirectType.push);
}
