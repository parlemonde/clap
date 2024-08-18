'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { questionTemplates } from 'src/database/schemas/question-template';

type EditQuestionTemplate = {
    id: number;
    question: string;
};
export async function editQuestionTemplate(editQuestionTemplate: EditQuestionTemplate): Promise<void> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db
        .update(questionTemplates)
        .set({
            question: editQuestionTemplate.question,
        })
        .where(eq(questionTemplates.id, editQuestionTemplate.id));

    // Return new scenario
    revalidatePath('/');
    revalidatePath('/admin/questions');
}
