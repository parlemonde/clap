import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

const SMTP_HOST = process.env.NODEMAILER_HOST || 'smtp.ethereal.email';
const SMTP_USER: string | null = process.env.NODEMAILER_USER || null;
const SMTP_PASSWORD: string | null = process.env.NODEMAILER_PASS || null;
const SMTP_PORT: number = parseInt(process.env.NODEMAILER_PORT || '', 10) || 587;

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
                    console.error('Error while creating ethereal fake smtp account.');
                    console.error(JSON.stringify(err));
                    resolve(null);
                    return;
                }
                // create reusable transporter object using the default SMTP transport
                // eslint-disable-next-line no-console
                console.info(`SMTP user: ${account.user}`);
                // eslint-disable-next-line no-console
                console.info(`SMTP pass: ${account.pass}`);

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
