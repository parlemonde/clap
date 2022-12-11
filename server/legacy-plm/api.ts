/* eslint-disable camelcase */
import axios from 'axios';
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
        const ssoResponse = await axios({
            method: 'POST',
            url: `${PLM_HOST_URL}/oauth/token`,
            data: {
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: `${CLAP_HOST_URL}/login`,
                code,
            },
        });
        const { access_token } = ssoResponse.data as { access_token: string };
        const userResponse = await axios({
            method: 'GET',
            url: `${PLM_HOST_URL}/oauth/me?access_token=${access_token}`,
        });
        const plmUser = userResponse.data as PLM_User;
        let user = await getRepository(User).findOne({
            where: { email: plmUser.user_email },
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
