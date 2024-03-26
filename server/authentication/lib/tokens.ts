import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { getRepository, MoreThan } from 'typeorm';

import { Token } from '../../entities/token';
import { generateToken } from '../../utils/generate-token';

const APP_SECRET: string = process.env.APP_SECRET || '';

export async function getAccessToken(
    userId: number,
    withRefreshToken: boolean = false,
): Promise<{
    accessToken: string;
    refreshToken: string;
}> {
    const accessToken = jwt.sign({ userId }, APP_SECRET, { expiresIn: '4h' });
    let refreshToken = '';
    if (withRefreshToken) {
        const rToken = generateToken(30);
        const token = new Token();
        token.token = await argon2.hash(rToken);
        token.userId = userId;
        await getRepository(Token).save(token);
        refreshToken = `${token.id}-${rToken}`;
    }

    return {
        accessToken,
        refreshToken,
    };
}

export async function getNewAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
} | null> {
    const expiredDate = new Date(new Date().getTime() - 7890000000); // now minus 3 months.

    const refreshTokenID: string = refreshToken.split('-')[0];
    const token = await getRepository(Token).findOne({
        where: {
            id: parseInt(refreshTokenID, 10) || 0,
            date: MoreThan(expiredDate),
        },
    });
    if (token === undefined || !(await argon2.verify(token.token, refreshToken.slice(refreshTokenID.length + 1)))) {
        await revokeRefreshToken(refreshToken);
        return null;
    }

    const accessToken = jwt.sign({ userId: token.userId }, APP_SECRET, { expiresIn: '1h' });
    return {
        accessToken,
        refreshToken,
    };
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
    const refreshTokenID: string = refreshToken.split('-')[0];
    await getRepository(Token).delete({
        id: parseInt(refreshTokenID, 10) || 0,
    });
}

export async function getStudentAccessToken(
    projectId: number,
    sequencyId: number,
    teacherId: number,
): Promise<{
    accessToken: string;
}> {
    const accessToken = jwt.sign({ projectId, sequencyId, teacherId, isStudent: true }, APP_SECRET, { expiresIn: '4h' });

    return {
        accessToken,
    };
}
