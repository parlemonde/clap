'use server';

import type { ProjectData } from '@server/database/schemas/projects';
import { generatePdf as generateProjectPdf } from '@server/pdf/generate-pdf';

export async function generatePdf(projectData: ProjectData): Promise<string | false> {
    return generateProjectPdf(projectData);
}
