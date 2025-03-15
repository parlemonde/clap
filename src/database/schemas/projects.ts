import { sql } from 'drizzle-orm';
import { integer, pgTable, serial, timestamp, varchar, char } from 'drizzle-orm/pg-core';

import { scenarios } from './scenarios';
import { themes } from './themes';
import { users } from './users';
import { json } from '../lib/custom-json';
import type { Sequence } from 'src/lib/project.types';

export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    userId: integer('userId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    language: char('language', { length: 2 }).notNull(),
    createDate: timestamp('createDate', { mode: 'string' }).notNull().defaultNow(),
    updateDate: timestamp('updateDate', { mode: 'string' })
        .notNull()
        .defaultNow()
        .$onUpdate(() => sql`now()`),
    deleteDate: timestamp('deleteDate', { mode: 'string' }),
    themeId: integer('themeId').references(() => themes.id, {
        onDelete: 'set null',
    }),
    themeName: varchar('themeName', { length: 200 }).notNull(),
    scenarioId: integer('scenarioId').references(() => scenarios.id, {
        onDelete: 'set null',
    }),
    scenarioName: varchar('scenarioName', { length: 200 }).notNull(),
    videoJobId: varchar('videoJobId', { length: 36 }),
    questions: json<'questions', Sequence[]>('questions').notNull().default([]),
    soundUrl: varchar('soundUrl', { length: 200 }),
    soundVolume: integer('soundVolume'),
    soundBeginTime: integer('soundBeginTime'),
    collaborationCode: varchar('collaborationCode', { length: 6 }),
    collaborationCodeExpiresAt: timestamp('collaborationCodeExpiresAt', { mode: 'string' }),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = Omit<typeof projects.$inferInsert, 'id' | 'createDate' | 'updateDate' | 'deleteDate' | 'userId'>;
