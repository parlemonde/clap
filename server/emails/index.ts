import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import path from 'path';
import pug from 'pug';

import { getI18n } from '../translations';
import { logger } from '../utils/logger';
import { getNodeMailer } from './nodemailer';
import { renderFile } from './renderFile';

let transporter: Mail | null = null;
getNodeMailer()
    .then((t) => {
        transporter = t;
    })
    .catch();

export enum Email {
    RESET_PASSWORD,
    VERIFY_EMAIL,
}
interface EmailMapping {
    [Email.RESET_PASSWORD]: { resetCode: string };
    [Email.VERIFY_EMAIL]: { verifyCode: string; pseudo: string };
}
type EmailOptions<E extends Email> = EmailMapping[E];

type emailData = {
    filename: string;
    filenameText: string;
    subject: string;
    args: { [key: string]: string };
};

function getTemplateData<E extends Email>(email: E, receiverEmail: string, options: EmailOptions<E>): emailData | undefined {
    const frontUrl = process.env.HOST_URL || 'http://localhost:5000';
    if (email === Email.RESET_PASSWORD) {
        return {
            filename: 'reset-password_mini.html',
            filenameText: 'reset-password_text.pug',
            subject: 'email_reset_password_subject',
            args: {
                resetUrl: `${frontUrl}/update-password?email=${encodeURI(receiverEmail)}&verify-token=${encodeURI(
                    (options as EmailOptions<Email.RESET_PASSWORD>).resetCode,
                )}`,
            },
        };
    }
    if (email === Email.VERIFY_EMAIL) {
        return {
            filename: 'verify-email_mini.html',
            filenameText: 'verify-email_text.pug',
            subject: 'email_verify_subject',
            args: {
                verifyUrl: `${frontUrl}/verify?email=${encodeURI(receiverEmail)}&verify-token=${encodeURI(
                    (options as EmailOptions<Email.VERIFY_EMAIL>).verifyCode,
                )}`,
                pseudo: (options as EmailOptions<Email.VERIFY_EMAIL>).pseudo,
            },
        };
    }
    return undefined;
}

export async function sendMail<E extends Email>(email: E, receiverEmail: string, options: EmailOptions<E>, language: string = 'fr'): Promise<void> {
    const frontUrl = process.env.HOST_URL || 'http://localhost:5000';
    const domain = process.env.HOST_DOMAIN || 'clap.parlemonde.org';
    if (transporter === null) {
        logger.error('Could not send mail, transporter is null!');
        return;
    }
    if (!receiverEmail) {
        logger.error('Could not send mail, receiver is null or undefined!');
        return;
    }

    // Get email template data
    const templateData = getTemplateData<E>(email, receiverEmail, options);
    if (templateData === undefined) {
        logger.info(`Template ${email} not found!`);
        return undefined;
    }
    const t = await getI18n(language);
    if (t === null) {
        logger.info(`Could not load locales for email ${email}!`);
        return undefined;
    }

    // Compile text and html
    const pugOptions = {
        ...templateData.args,
        frontUrl,
        receiverEmail,
        plmoEmail: `contact@${domain}`,
    };
    try {
        const html = await renderFile(path.join(__dirname, 'templates', templateData.filename), pugOptions, t);
        const text = pug.renderFile(path.join(__dirname, 'templates', templateData.filenameText), { ...pugOptions, t, cache: true });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"Par Le Monde" <ne-pas-repondre@${domain}>`, // sender address
            to: receiverEmail, // receiver address
            subject: t(templateData.subject), // Subject line
            text, // plain text body
            html, // html body
        });

        logger.info(`Message sent: ${info.messageId}`);
        if (nodemailer.getTestMessageUrl(info)) {
            logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`); // Preview only available when sending through an Ethereal account
        }
    } catch (e) {
        logger.error(e);
    }
}
