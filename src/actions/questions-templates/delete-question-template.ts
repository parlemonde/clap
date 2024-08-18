'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import { questionTemplates } from 'src/database/schemas/question-template';

export async function deleteQuestionTemplate(questionTemplateId: number) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return;
    }

    await db.delete(questionTemplates).where(eq(questionTemplates.id, questionTemplateId));
    revalidatePath('/');
    revalidatePath('/admin/questions');
}
