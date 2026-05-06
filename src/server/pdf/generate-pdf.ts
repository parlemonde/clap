'use server';

import { eq } from 'drizzle-orm';
import { getExtracted, getLocale } from 'next-intl/server';
import puppeteer from 'puppeteer';
import { createElement } from 'react';
import { v4 } from 'uuid';

import { getCurrentUser } from '@server/auth/get-current-user';
import { db } from '@server/database';
import type { ProjectData } from '@server/database/schemas/projects';
import { scenarios } from '@server/database/schemas/scenarios';
import { uploadFile } from '@server/file-upload/file-upload';
import { getSignedImageUrl } from '@server/file-upload/get-signed-image-url';
import { getEnvVariable } from '@server/get-env-variable';
import { logger } from '@server/logger';

import fontBase64 from './assets/font_base64.txt';
import userLogoBase64 from './assets/userLogo_base64.txt';
import StoryboardPdfTemplate from './templates/StoryboardPdf';
import type { StoryboardPdfLabels } from './templates/templates.types';

const getScenarioDescription = async (scenarioId: ProjectData['scenarioId'], locale: string): Promise<string | null> => {
    if (typeof scenarioId !== 'number') {
        return null;
    }

    const scenario = await db.query.scenarios.findFirst({
        where: eq(scenarios.id, scenarioId),
    });

    if (!scenario) {
        return null;
    }

    return scenario.descriptions[locale] || scenario.descriptions.fr || null;
};

const getHostUrl = (): string => getEnvVariable('HOST_URL').replace(/\/$/, '');

const getPdfHtml = async (params: {
    currentLocale: string;
    hostUrl: string;
    logoFont: string;
    project: ProjectData & { name?: string | null };
    pseudo: string | null;
    scenarioDescription: string | null;
    labels: StoryboardPdfLabels;
    userLogo: string;
}): Promise<string> => {
    const { renderToStaticMarkup } = await import('react-dom/server');

    return `<!doctype html>${renderToStaticMarkup(createElement(StoryboardPdfTemplate, params))}`;
};

const getPdfBuffer = async (html: string): Promise<Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
        await page.emulateMediaType('print');

        const pdf = await page.pdf({
            displayHeaderFooter: true,
            footerTemplate:
                "<div style='font-size:8px!important;color:grey!important;padding-right:1cm;text-align: right;width:100%;position: relative;' class='pdffooter'><span class='pageNumber'></span>/<span class='totalPages'></span></div>",
            format: 'a4',
            headerTemplate: '<div></div>',
            margin: {
                top: '50px',
                right: '0px',
                bottom: '50px',
                left: '0px',
            },
            printBackground: true,
        });

        return Buffer.from(pdf);
    } finally {
        await browser.close();
    }
};

const getSignedProjectImages = async (projectData: ProjectData, userId: string): Promise<ProjectData> => {
    const project = structuredClone(projectData);
    const allImages = [...new Set(project.questions.flatMap((question) => question.plans.map((plan) => plan.imageUrl).filter(Boolean)))];

    const signedUrls = Object.fromEntries(
        await Promise.all(allImages.map(async (image) => [image, await getSignedImageUrl(image, userId)] as const)),
    );

    for (const question of project.questions) {
        for (const plan of question.plans) {
            if (signedUrls[plan.imageUrl]) {
                plan.imageUrl = signedUrls[plan.imageUrl];
            }
        }
    }

    return project;
};

export async function generatePdf(projectData: ProjectData): Promise<string | false> {
    const user = await getCurrentUser();
    const tx = await getExtracted('pdf');
    const currentLocale = await getLocale();
    const labels: StoryboardPdfLabels = {
        title: tx('Plan de tournage'),
        subtitleDescription: tx('Description générale :'),
        theme: tx('Thème :'),
        scenario: tx('Scénario :'),
        subtitleStoryboard: tx('Storyboard :'),
        subtitleToCamera: tx('À votre caméra !'),
        toCameraDescription: tx("Flashez le code QR suivant pour accéder directement à l'application et démarrer le tournage."),
    };
    const hostUrl = getHostUrl();

    try {
        const project = await getSignedProjectImages(projectData, user?.id ?? '');
        const scenarioDescription = await getScenarioDescription(project.scenarioId, currentLocale);
        const html = await getPdfHtml({
            currentLocale,
            hostUrl,
            logoFont: fontBase64,
            project,
            pseudo: user?.name || null,
            scenarioDescription,
            labels,
            userLogo: userLogoBase64,
        });
        const pdfBuffer = await getPdfBuffer(html);
        const fileKey = `media/pdf/${v4()}/Plan-de-tournage.pdf`;

        await uploadFile(fileKey, pdfBuffer, 'application/pdf');

        return `/${fileKey}`;
    } catch (error) {
        logger.error(error);
        return false;
    }
}
