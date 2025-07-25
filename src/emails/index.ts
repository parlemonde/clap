import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type SESTransport from 'nodemailer/lib/ses-transport';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { getNodeMailer } from './nodemailer';
import { renderFile } from './render-file';
import resetPasswordHtml from './templates/reset-password.html';
import resetPasswordText from './templates/reset-password.txt';
import { getTranslation } from 'src/actions/get-translation';

const DOMAIN = process.env.HOST_DOMAIN || process.env.HOST_URL?.split('://')[1] || '';
const HOST_URL = process.env.HOST_URL || '';

type ResetPasswordEmail = {
    kind: 'reset-password';
    data: {
        resetCode: string;
    };
};
type EmailKind = ResetPasswordEmail;

/**
 * Register service: Stores instances in `global` to prevent memory leaks in development.
 *
 */
const registerService = <T>(name: string, defaultValue: T): T => {
    if (process.env.NODE_ENV !== 'production') {
        if (!(name in global) || (global as Record<string, unknown>)[name] === null) {
            (global as Record<string, unknown>)[name] = defaultValue;
        }
        return (global as Record<string, unknown>)[name] as T;
    }
    return defaultValue;
};

let nodeMailer: Mail<SESTransport.SentMessageInfo | SMTPTransport.SentMessageInfo> | null = registerService('mailer', null);
export async function sendMail(to: string, kind: EmailKind): Promise<void> {
    if (nodeMailer === null) {
        const newNodeMailer = await getNodeMailer();
        if (newNodeMailer === null) {
            return;
        }
        nodeMailer = registerService('mailer', newNodeMailer);
    }

    if (!nodeMailer || !to) {
        return;
    }

    const { t } = await getTranslation();

    const subject = 'email.reset_password_subject';
    const emailData: Record<string, string> = {
        frontUrl: HOST_URL,
        receiverEmail: to,
        plmoEmail: `contact@${DOMAIN}`,
    };
    switch (kind.kind) {
        case 'reset-password': {
            // subject = 'email.reset_password_subject';
            emailData.resetUrl = `${HOST_URL}/update-password?email=${encodeURI(to)}&verify-token=${encodeURI(kind.data.resetCode)}`;
            break;
        }
    }

    try {
        const htmlFile = kind.kind === 'reset-password' ? resetPasswordHtml : '';
        const textFile = kind.kind === 'reset-password' ? resetPasswordText : '';
        const html = await renderFile(htmlFile, emailData, t);
        const text = await renderFile(textFile, emailData, t);

        // send mail with defined transport object
        const info = await nodeMailer.sendMail({
            from: `"Par Le Monde" <ne-pas-repondre@${DOMAIN}>`, // sender address
            to, // receiver address
            subject: t(subject), // Subject line
            text, // plain text body
            html, // html body
        });

        // eslint-disable-next-line no-console
        console.info(`Message sent: ${info.messageId}`);
        if (nodemailer.getTestMessageUrl(info)) {
            // eslint-disable-next-line no-console
            console.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`); // Preview only available when sending through an Ethereal account
        }
    } catch (e) {
        console.error(e);
    }
}
