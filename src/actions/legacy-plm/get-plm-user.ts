/* eslint-disable camelcase */
import { eq } from 'drizzle-orm';

import { createPlmUser } from './create-plm-user';
import type { PLMUser } from './plm-user.types';
import { db } from 'src/database';
import type { User } from 'src/database/schemas/users';
import { users } from 'src/database/schemas/users';
import { jsonFetcher } from 'src/lib/json-fetcher';

const SSO_HOST_URL = process.env.SSO_HOST || '';
const CLAP_HOST_URL = process.env.HOST_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

export async function getPlmUser(code: string): Promise<User | null> {
    try {
        const { access_token } = await jsonFetcher<{ access_token: string }>(`${SSO_HOST_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                ['Content-Type']: 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: `${CLAP_HOST_URL}/login`,
                code,
            }),
        });
        const plmUser = await jsonFetcher<PLMUser>(`${SSO_HOST_URL}/oauth/me?access_token=${access_token}`, {
            method: 'GET',
        });
        let user = await db.query.users.findFirst({
            columns: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
            where: eq(users.email, plmUser.email),
        });
        if (user === undefined) {
            user = await createPlmUser(plmUser);
        }
        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
}
