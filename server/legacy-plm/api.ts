/* eslint-disable camelcase */
import { getRepository } from 'typeorm';

import { User } from '../entities/user';
import { logger } from '../lib/logger';
import type { PLM_User } from './user';
import { createPLMUserToDB } from './user';

const PLM_HOST_URL = process.env.PLM_HOST || '';
const CLAP_HOST_URL = process.env.HOST_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

export async function getUserFromPLM(code: string): Promise<User | null> {
    try {
        const ssoResponse = await fetch(`${PLM_HOST_URL}/oauth/token`, {
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
        const { access_token } = (await ssoResponse.json()) as { access_token: string };
        const userResponse = await fetch(`${PLM_HOST_URL}/oauth/me?access_token=${access_token}`, {
            method: 'GET',
        });
        const plmUser = (await userResponse.json()) as PLM_User;
        let user = await getRepository(User).findOne({
            where: { email: plmUser.email },
        });
        if (user === undefined) {
            user = await createPLMUserToDB(plmUser);
        }
        return user;
    } catch (error) {
        logger.error(error);
        return null;
    }
}
