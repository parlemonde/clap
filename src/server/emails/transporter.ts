import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

import { getEnvVariable } from '@server/get-env-variable';
import { logger } from '@server/logger';
import { registerService } from '@server/register-service';

const transporter = registerService('email-transport', async (): Promise<Transporter> => {
    const host = getEnvVariable('NODEMAILER_HOST');
    const port = getEnvVariable('NODEMAILER_PORT');
    const user = getEnvVariable('NODEMAILER_USER');
    const password = getEnvVariable('NODEMAILER_PASS');

    if (!user || !password) {
        const testAccount = await nodemailer.createTestAccount();
        logger.info(`Created test account:
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
