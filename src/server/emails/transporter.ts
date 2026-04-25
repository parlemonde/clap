import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

import { registerService } from '@server/register-service';

const transporter = registerService('email-transport', async (): Promise<Transporter> => {
    const host = process.env.NODEMAILER_HOST;
    const port = process.env.NODEMAILER_PORT;
    const user = process.env.NODEMAILER_USER;
    const password = process.env.NODEMAILER_PASS;

    if (!user || !password) {
        const testAccount = await nodemailer.createTestAccount();
        // eslint-disable-next-line
        console.info(`Created test account:
            User: ${testAccount.user},
            Pass: ${testAccount.pass}`);

        return nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    return nodemailer.createTransport({
        host: host ?? 'smtp.ethereal.email',
        port: port ? Number(port) : 587,
        secure: port === '465',
        auth: {
            user: user,
            pass: password,
        },
    });
});
export const getTransporter = () => transporter;
