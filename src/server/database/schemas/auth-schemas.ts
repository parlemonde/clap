/* eslint-disable camelcase */
import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, index, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const auth_sessions = pgTable(
    'auth_sessions',
    {
        id: uuid().primaryKey().defaultRandom(),
        expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
        token: text('token').notNull().unique(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        impersonatedBy: text('impersonated_by'),
        data: text('data'),
    },
    (table) => [index('auth_sessions_userId_idx').on(table.userId)],
);

export const auth_accounts = pgTable(
    'auth_accounts',
    {
        id: uuid().primaryKey().defaultRandom(),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id').notNull(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        idToken: text('id_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
        scope: text('scope'),
        password: text('password'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index('auth_accounts_userId_idx').on(table.userId)],
);

export const auth_verifications = pgTable(
    'auth_verifications',
    {
        id: uuid().primaryKey().defaultRandom(),
        identifier: text('identifier').notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index('auth_verifications_identifier_idx').on(table.identifier)],
);

export const usersRelations = relations(users, ({ many }) => ({
    auth_sessionss: many(auth_sessions),
    auth_accountss: many(auth_accounts),
}));

export const auth_sessionsRelations = relations(auth_sessions, ({ one }) => ({
    users: one(users, {
        fields: [auth_sessions.userId],
        references: [users.id],
    }),
}));

export const auth_accountsRelations = relations(auth_accounts, ({ one }) => ({
    users: one(users, {
        fields: [auth_accounts.userId],
        references: [users.id],
    }),
}));
