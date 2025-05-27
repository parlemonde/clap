'use server';

import pug from 'pug';
import { v4 } from 'uuid';

import logoFont from './font_base64.txt';
import generatePdfPug from './generate-pdf-template.pug';
import userLogo from './userLogo_base64.txt';
import { getSignedImageUrl } from 'src/actions/files/get-signed-image-url';
import { getCurrentUser } from 'src/actions/get-current-user';
import { getTranslation } from 'src/actions/get-translation';
import { getScenario } from 'src/actions/scenarios/get-scenario';
import { invokeLambda } from 'src/aws/lambda';
import type { ProjectData } from 'src/database/schemas/projects';
import { registerService } from 'src/lib/register-service';

const isObjectLiteral = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isPdfResult = (value: unknown): value is { url: string } => isObjectLiteral(value) && typeof value.url === 'string' && value.url.length > 0;

let toPdfHtml: pug.compileTemplate | undefined;
function getToPdfHtml(): pug.compileTemplate {
    if (!toPdfHtml) {
        toPdfHtml = registerService('to-pdf-html', () => pug.compile(generatePdfPug));
    }
    return toPdfHtml;
}

export async function generatePdf(projectData: ProjectData): Promise<string | false> {
    const user = await getCurrentUser();
    const { t, currentLocale } = await getTranslation();

    const project = structuredClone(projectData); // Deep clone to avoid mutating the original project data
    const scenario = typeof project.scenarioId === 'number' ? await getScenario(project.scenarioId) : null;
    const scenarioDescription = scenario?.descriptions[currentLocale] || scenario?.descriptions.fr || null;

    const allImages = [...new Set(project.questions.flatMap((question) => question.plans.map((plan) => plan.imageUrl)))];
    const signedUrls = Object.fromEntries(
        (await Promise.all(allImages.map((image) => getSignedImageUrl(image, user?.id ?? -1)))).map((url, index) => [allImages[index], url]),
    );
    for (const question of project.questions) {
        for (const plan of question.plans) {
            plan.imageUrl = signedUrls[plan.imageUrl]; // Replace all image urls with signed urls
        }
    }

    try {
        const html = getToPdfHtml()({
            hostUrl: process.env.HOST_URL || '',
            project,
            pseudo: user?.name || null,
            scenarioDescription,
            logoFont,
            userLogo,
            t,
        });
        const id = v4();
        const s3Key = `media/pdf/${id}/Plan-de-tournage.pdf`;
        const result = await invokeLambda({
            kind: 'pdf',
            payload: {
                html,
                s3BucketName: process.env.S3_BUCKET_NAME || '',
                s3Key,
            },
        });
        if (isPdfResult(result)) {
            return `/${s3Key}`;
        }
    } catch (e) {
        console.error(e);
    }
    return false;
}
