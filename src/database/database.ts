import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { languages } from './schemas/languages';
import { projects } from './schemas/projects';
import { questionTemplates } from './schemas/question-template';
import { scenarios } from './schemas/scenarios';
import { themes } from './schemas/themes';
import { users } from './schemas/users';

/**
 * Register service: Stores instances in `global` to prevent memory leaks in development.
 *
 */
const registerService = <T>(name: string, initFn: () => T): T => {
    if (process.env.NODE_ENV !== 'production') {
        if (!(name in global)) {
            (global as Record<string, unknown>)[name] = initFn();
        }
        return (global as Record<string, unknown>)[name] as T;
    }
    return initFn();
};

const queryClient = postgres(process.env.DATABASE_URL || '', { max: 10 });

export const db = registerService('db', () =>
    drizzle(queryClient, {
        logger: process.env.NODE_ENV !== 'production',
        schema: { users, themes, scenarios, questionTemplates, languages, projects },
    }),
);
