/* eslint-disable camelcase */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { registerService } from 'src/lib/register-service';

import { auth_sessions } from './schemas/auth-schemas';
import { auth_accounts } from './schemas/auth-schemas';
import { auth_verifications } from './schemas/auth-schemas';
import { languages } from './schemas/languages';
import { projects } from './schemas/projects';
import { questions } from './schemas/questions';
import { scenarios } from './schemas/scenarios';
import { themes } from './schemas/themes';
import { users } from './schemas/users';

const ssl = !process.env.DATABASE_URL?.includes('localhost');
const queryClient = new Pool({ connectionString: process.env.DATABASE_URL, ssl, max: 10 });

export const db = registerService('db', () =>
    drizzle({
        client: queryClient,
        logger: process.env.NODE_ENV !== 'production',
        schema: { users, themes, scenarios, questions, languages, projects, auth_sessions, auth_accounts, auth_verifications },
    }),
);
