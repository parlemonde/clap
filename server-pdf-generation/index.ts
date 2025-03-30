import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { AwsClient } from 'aws4fetch'

type Response = {
    url: string;
};

const isObjectLiteral = (value: unknown): value is Record<string, unknown> => 
    typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';

export async function handler(event: unknown): Promise<Response> {
    const payload = isObjectLiteral(event) ? event : {};
    const html = isString(payload.html) ? payload.html : '';
    const s3BucketName = isString(payload.s3BucketName) ? payload.s3BucketName : '';
    const s3Region = isString(payload.s3Region) ? payload.s3Region : process.env.AWS_REGION;
    const s3Key = isString(payload.s3Key) ? payload.s3Key : '';

    if (!html || !s3BucketName || !s3Region ||!s3Key) {
        return {
            url: '',
        };
    }

    try {
        // 1 - Generate PDF
        chromium.setGraphicsMode = false;
        await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin'),
            headless: chromium.headless,
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
        await page.emulateMediaType('print');
        const pdfBuffer = await page.pdf({
            format: 'a4',
            margin: {
                top: '50px',
                right: '0px',
                bottom: '50px',
                left: '0px',
            },
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate:
                "<div style='font-size:8px!important;color:grey!important;padding-right:1cm;text-align: right;width:100%;position: relative;' class='pdffooter'><span class='pageNumber'></span>/<span class='totalPages'></span></div>",
        });
        await browser.close();

        // 2 - Upload PDF to S3
        const s3BaseUrl = `https://${s3BucketName}.s3.${s3Region}.amazonaws.com`;
        const filename = s3Key.endsWith('.pdf') ? s3Key : `${s3Key}.pdf`;
        const key = `${s3BaseUrl}/${filename}`;
        const awsClient = new AwsClient({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
            sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
            region: process.env.AWS_REGION,
        });
        await awsClient.fetch(key, {
            method: 'PUT',
            body: pdfBuffer,
            headers: {
                'Content-Length': pdfBuffer.length.toString(),
                'Content-Type': 'application/pdf',
            },
        });

        // 3 - Return URL
        return {
            url: filename,
        };
    } catch (error) {
        console.error(error);
        return {
            url: '',
        };
    }
}
