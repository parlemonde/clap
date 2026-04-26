import { getTranslations } from 'next-intl/server';
import { render, toPlainText } from 'react-email';

import { getTransporter } from '@server/emails/transporter';
import { getEnvVariable } from '@server/get-env-variable';
import type { tFunction } from '@server/i18n/types';
import { logger } from '@server/logger';

import ResetPasswordTemplate from './templates/ResetPasswordEmail';
import type { BaseTemplateProps } from './templates/templates.types';

const templates = {
    'reset-password': ResetPasswordTemplate,
} as const;
type templatesType = typeof templates;
type templatesKind = keyof templatesType;

const subjects: Record<templatesKind, string> = {
    'reset-password': 'email.reset_password_subject',
};

const getTranslationFunction = (translator: Awaited<ReturnType<typeof getTranslations>>): tFunction => {
    const translate = translator as (key: string, options?: Parameters<tFunction>[1]) => string;
    return (key, options = {}) => translate(key, options);
};
const getAppUrl = () => getEnvVariable('HOST_URL').replace(/\/$/, '');
const getContactEmail = (appUrl: string): string => {
    const domain = getEnvVariable('HOST_DOMAIN') || getEnvVariable('HOST_URL').split('://')[1] || appUrl.split('://')[1] || '';
    if (domain) {
        return `contact@${domain}`;
    }
    return getEnvVariable('NODEMAILER_USER') || 'contact@parlemonde.org';
};

export const sendEmail = async <Kind extends templatesKind>(
    to: string,
    kind: Kind,
    props: Omit<Parameters<templatesType[Kind]>[0], keyof BaseTemplateProps>,
) => {
    try {
        const domain = getEnvVariable('HOST_DOMAIN');
        const user = domain ? `ne-pas-repondre@${domain}` : getEnvVariable('NODEMAILER_USER');
        const transporter = await getTransporter();
        const appUrl = getAppUrl();
        const translator = await getTranslations();
        const t = getTranslationFunction(translator);
        const baseProps: BaseTemplateProps = {
            appUrl,
            receiverEmail: to,
            contactEmail: getContactEmail(appUrl),
            t,
        };
        const html = await render(templates[kind]({ ...baseProps, ...props }));
        const text = toPlainText(html);
        await transporter.sendMail({
            from: `"Clap - Par Le Monde" <${user}>`,
            to,
            subject: t(subjects[kind]),
            html,
            text,
        });
    } catch (e) {
        logger.error(e);
    }
};
