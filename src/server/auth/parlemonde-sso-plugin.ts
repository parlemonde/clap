import { genericOAuth } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';

import { jsonFetcher } from '@lib/json-fetcher';
import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import type { UserRole } from '@server/database/schemas/users';
import { registerService } from '@server/register-service';

interface PLMUser {
    id: string;
    email: string;
    pseudo: string;
    school?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    groups?: Array<{
        name: string; // village name
        id: string; // number in string, village id
        is_admin: string; // boolean in string ("0" or "1")
        is_mod: string; // boolean in string ("0" or "1")
        user_title: string;
    }>;
}

export const PARLEMONDE_SSO_PROVIDER_ID = 'parlemonde-sso';
const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

export const isParlemondeSSOPluginEnabled = CLIENT_ID !== '' && CLIENT_SECRET !== '';

export const ssoPlugin = registerService('parlemonde-sso-plugin', () =>
    isParlemondeSSOPluginEnabled
        ? genericOAuth({
              config: [
                  {
                      providerId: PARLEMONDE_SSO_PROVIDER_ID,
                      redirectURI: `${process.env.HOST_URL || ''}/login`,
                      responseType: 'code',
                      clientId: CLIENT_ID,
                      clientSecret: CLIENT_SECRET,
                      authorizationUrl: `https://prof.parlemonde.org/oauth/authorize`,
                      tokenUrl: `https://prof.parlemonde.org/oauth/token`,
                      getUserInfo: async (tokens) => {
                          const plmUser = await jsonFetcher<PLMUser>(`https://prof.parlemonde.org/oauth/me?access_token=${tokens.accessToken}`, {
                              method: 'GET',
                          });
                          // 1. create user in database if not exists
                          let user: { id: string; role: UserRole } | undefined = await db.query.users.findFirst({
                              columns: {
                                  id: true,
                                  role: true,
                              },
                              where: eq(users.email, plmUser.email),
                          });
                          if (!user) {
                              let role: UserRole = 'teacher';
                              const userGroups = plmUser.groups || [];
                              if (userGroups.length > 1) {
                                  if (
                                      plmUser.groups?.some((g) => parseInt(g.is_mod, 10) === 1) ||
                                      plmUser.groups?.some((g) => parseInt(g.is_admin, 10) === 1)
                                  ) {
                                      role = 'admin';
                                  }
                              }
                              user = (
                                  await db
                                      .insert(users)
                                      .values({
                                          email: plmUser.email,
                                          emailVerified: true,
                                          name: plmUser.pseudo,
                                          role,
                                      })
                                      .returning({
                                          id: users.id,
                                          role: users.role,
                                      })
                              )[0];
                          }
                          // 3. return user info
                          return {
                              id: plmUser.id,
                              email: plmUser.email,
                              name: plmUser.pseudo,
                              emailVerified: true,
                          };
                      },
                  },
              ],
          })
        : undefined,
);
