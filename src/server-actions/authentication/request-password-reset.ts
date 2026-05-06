/* eslint-disable camelcase */
'use server';

import { eq, and } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

import { getAuth } from '@server/auth/auth';
import { PARLEMONDE_SSO_PROVIDER_ID } from '@server/auth/parlemonde-sso-plugin';
import { db } from '@server/database';
import { auth_accounts } from '@server/database/schemas/auth-schemas';
import { users } from '@server/database/schemas/users';

export async function requestPasswordReset(email: string): Promise<string> {
    const commonT = await getExtracted('common');
    const ssoProvider = PARLEMONDE_SSO_PROVIDER_ID;
    const result = await db
        .select({
            providers: auth_accounts.providerId,
        })
        .from(auth_accounts)
        .leftJoin(users, eq(users.id, auth_accounts.userId))
        .where(and(eq(users.email, email)));
    if (result.some((r) => r.providers === ssoProvider) && result.every((r) => r.providers !== 'credential')) {
        return commonT('Veuillez utiliser la connection avec prof.ParLeMonde.org pour vous connecter.');
    }

    try {
        await getAuth().api.requestPasswordReset({
            body: {
                email,
            },
        });
    } catch {
        return commonT('Une erreur est survenue...');
    }

    return '';
}
