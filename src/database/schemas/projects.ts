import { sql } from 'drizzle-orm';
import { integer, pgTable, serial, timestamp, varchar, char } from 'drizzle-orm/pg-core';

import { scenarios } from './scenarios';
import { themes } from './themes';
import { users } from './users';
import { json } from '../lib/custom-json';

export interface Title {
    text: string;
    duration: number;
    x: number;
    y: number;
    width: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
}
export interface Plan {
    id: number;
    description: string;
    imageUrl: string;
    duration: number;
}
export interface Sequence {
    id: number;
    question: string;
    plans: Plan[];
    title?: Title;
    voiceText?: string;
    soundUrl?: string;
    soundVolume?: number;
    voiceOffBeginTime?: number;
    status?: 'storyboard' | 'storyboard-validating' | 'pre-mounting' | 'pre-mounting-validating' | 'validated';
    feedbacks?: string[];
}
export interface ProjectData {
    themeId: string | number;
    themeName: string;
    scenarioId: string | number;
    scenarioName: string;
    questions: Sequence[];
    soundUrl?: string;
    soundVolume?: number;
    soundBeginTime?: number;
}

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
    scenarioId: integer('scenarioId').references(() => scenarios.id, {
        onDelete: 'set null',
    }),
    videoJobId: varchar('videoJobId', { length: 36 }),
    data: json<'data', ProjectData>('data').notNull(),
    collaborationCode: varchar('collaborationCode', { length: 6 }),
    collaborationCodeExpiresAt: timestamp('collaborationCodeExpiresAt', { mode: 'string' }),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = Omit<typeof projects.$inferInsert, 'id' | 'createDate' | 'updateDate' | 'deleteDate' | 'userId'>;
