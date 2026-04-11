import { hash, verify } from '@node-rs/argon2';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { adminAc, userAc } from 'better-auth/plugins/admin/access';
import { sendMail } from 'src/emails/index';

import { db } from '@server/database';
import { registerService } from '@server/register-service';

import { ssoPlugin } from './parlemonde-sso-plugin';

const adminPlugin = admin({
    defaultRole: 'teacher',
    roles: {
        admin: adminAc,
        teacher: userAc,
        student: userAc,
    },
});
const cookiesPlugin = nextCookies();

export const auth = registerService('auth', () =>
    betterAuth({
        database: drizzleAdapter(db, {
            provider: 'pg',
        }),
        plugins: ssoPlugin ? [ssoPlugin, adminPlugin, cookiesPlugin] : [adminPlugin, cookiesPlugin], // make sure `nextCookies()` is the last plugin in the array
        emailAndPassword: {
            enabled: true,
            disableSignUp: true,
            password: {
                hash,
                verify: ({ hash, password }) => verify(hash, password),
            },
            sendResetPassword: async ({ user, token }) => {
                void sendMail(user.email, {
                    kind: 'reset-password',
                    data: {
                        resetCode: token,
                    },
                });
            },
        },
        advanced: {
            database: {
                generateId: false, // Done by database directly
            },
        },
        user: {
            modelName: 'users',
            changeEmail: {
                enabled: true,
                updateEmailWithoutVerification: true,
            },
        },
        session: {
            modelName: 'auth_sessions',
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60, // Cache duration in seconds
            },
        },
        account: {
            modelName: 'auth_accounts',
        },
        verification: {
            modelName: 'auth_verifications',
        },
    }),
);
