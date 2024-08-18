import { integer, pgTable, serial, varchar, char } from 'drizzle-orm/pg-core';

import { scenarios } from './scenarios';

export const questionTemplates = pgTable('question-templates', {
    id: serial('id').primaryKey(),
    question: varchar('question', { length: 280 }).notNull(),
    order: integer('order').notNull().default(0),
    languageCode: char('languageCode', { length: 2 }).notNull(),
    scenarioId: integer('scenarioId')
        .references(() => scenarios.id, {
            onDelete: 'cascade',
        })
        .notNull(),
});

export type QuestionTemplate = typeof questionTemplates.$inferSelect;
export type NewQuestionTemplate = Omit<typeof questionTemplates.$inferInsert, 'id'>;
