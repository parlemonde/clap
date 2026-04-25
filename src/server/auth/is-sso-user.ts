import { and, count, eq, ne } from 'drizzle-orm';

import { db } from '@server/database';
import { auth_accounts as authAccounts } from '@server/database/schemas/auth-schemas';

/**
 * Check if a user has only SSO authentication (no credential/email-password auth)
 */
export const isSSOUser = async (userId: string): Promise<boolean> => {
    const result = await db
        .select({ count: count() })
        .from(authAccounts)
        .where(and(eq(authAccounts.userId, userId), ne(authAccounts.providerId, 'credential')));

    return result[0].count > 0;
};
