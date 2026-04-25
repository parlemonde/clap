/* eslint-disable camelcase */
import { auth_accounts } from './schemas/auth-schemas';
import { auth_sessions } from './schemas/auth-schemas';
import { auth_verifications } from './schemas/auth-schemas';
import { languages } from './schemas/languages';
import { projects } from './schemas/projects';
import { questions } from './schemas/questions';
import { scenarios } from './schemas/scenarios';
import { themes } from './schemas/themes';
import { users } from './schemas/users';

export const databaseSchema = {
    users,
    themes,
    scenarios,
    questions,
    languages,
    projects,
    auth_sessions,
    auth_accounts,
    auth_verifications,
} as const;

export type DatabaseSchema = typeof databaseSchema;
