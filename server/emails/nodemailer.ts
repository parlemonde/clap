import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

import { logger } from '../lib/logger';

const SMTP_HOST = process.env.NODEMAILER_HOST || 'smtp.ethereal.email';
const SMTP_USER: string | null = process.env.NODEMAILER_USER || null;
const SMTP_PASSWORD: string | null = process.env.NODEMAILER_PASS || null;
const SMTP_PORT: number = parseInt(process.env.NODEMAILER_PORT || '', 10) || 587;

/**
 * Returns the nodemailer object to send emails by smtp.
 */
export function getNodeMailer(): Promise<Mail | null> {
    return new Promise((resolve) => {
        if (SMTP_USER !== null && SMTP_PASSWORD !== null) {
            resolve(
                nodemailer.createTransport({
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    secure: SMTP_PORT === 465, // true for 465, false for other ports
                    auth: {
                        user: SMTP_USER,
                        pass: SMTP_PASSWORD,
                    },
                }),
            );
        } else {
            nodemailer.createTestAccount((err, account) => {
                if (err !== null) {
                    logger.error('Error while creating ethereal fake smtp account.');
                    logger.error(JSON.stringify(err));
                    resolve(null);
                    return;
                }
                // create reusable transporter object using the default SMTP transport
                logger.info(`SMTP user: ${account.user}`);
                logger.info(`SMTP pass: ${account.pass}`);

                resolve(
                    nodemailer.createTransport({
                        host: 'smtp.ethereal.email',
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: account.user, // generated ethereal user
                            pass: account.pass, // generated ethereal password
                        },
                    }),
                );
            });
        }
    });
}
