import type { JSONSchemaType } from 'ajv';
import type { Request, Response } from 'express';
import { getRepository } from 'typeorm';

// import { QuestionStatus } from '../../types/models/question.type';
import { Project } from '../entities/project';
import { Question } from '../entities/question';
import { User } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { AppError } from '../middlewares/handle-errors';
import { ANONYMOUS_USER } from '../utils/anonymous-user';
import { getStudentAccessToken } from './lib/tokens';

const APP_SECRET: string = process.env.APP_SECRET || '';

// --- LOGIN ---
type LoginData = {
    projectId: number;
    sequencyId: number;
    teacherId: number;
};
const LOGIN_SCHEMA: JSONSchemaType<LoginData> = {
    type: 'object',
    properties: {
        projectId: { type: 'number' },
        sequencyId: { type: 'number' },
        teacherId: { type: 'number' },
    },
    required: ['projectId', 'sequencyId', 'teacherId'],
    additionalProperties: false,
};
const loginValidator = ajv.compile(LOGIN_SCHEMA);
export async function loginStudent(req: Request, res: Response): Promise<void> {
    if (APP_SECRET.length === 0 || !req.isCsrfValid) {
        throw new AppError('forbidden');
    }
    const data = req.body;
    if (!loginValidator(data)) {
        sendInvalidDataError(loginValidator);
        return;
    }

    const project = await getRepository(Project).findOne({ where: { id: data.projectId } });
    const teacher = await getRepository(User).findOne({ where: { id: data.teacherId } });
    const sequency = await getRepository(Question).findOne({
        where: { id: data.sequencyId },
        relations: ['project', 'project.user'],
    });

    // Check if data are correct before connect student as anonymous
    if (
        project === undefined ||
        teacher === undefined ||
        sequency === undefined ||
        project.id !== sequency.project.id ||
        teacher.id !== sequency.project.user.id ||
        project.isCollaborationActive !== true
    ) {
        throw new AppError('loginError', ['Unauthorized - Invalid QRCode.'], 0);
    }

    const { accessToken } = await getStudentAccessToken(project.id, sequency.id, teacher.id);
    res.cookie('access-token', accessToken, {
        maxAge: 4 * 60 * 60000,
        expires: new Date(Date.now() + 4 * 60 * 60000),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    res.sendJSON({
        accessToken,
        projectId: project.id,
        sequencyId: sequency.id,
        teacherId: teacher.id,
        user: ANONYMOUS_USER,
    });
}
