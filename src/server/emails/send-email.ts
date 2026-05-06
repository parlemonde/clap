import { getExtracted } from 'next-intl/server';
import { render, toPlainText } from 'react-email';

import { getTransporter } from '@server/emails/transporter';
import { getEnvVariable } from '@server/get-env-variable';
import { logger } from '@server/logger';

import type { ResetPasswordTemplateProps } from './templates/ResetPasswordEmail';
import ResetPasswordTemplate from './templates/ResetPasswordEmail';
import type { BaseTemplateProps } from './templates/templates.types';

const templates = {
    'reset-password': ResetPasswordTemplate,
} as const;
type templatesType = typeof templates;
type templatesKind = keyof templatesType;

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
    props: Kind extends 'reset-password' ? { token: string } : never,
) => {
    try {
        const domain = getEnvVariable('HOST_DOMAIN');
        const user = domain ? `ne-pas-repondre@${domain}` : getEnvVariable('NODEMAILER_USER');
        const transporter = await getTransporter();
        const appUrl = getAppUrl();
        const tx = await getExtracted('email');
        const subject = (() => {
            switch (kind) {
                case 'reset-password':
                    return tx('Réinitialisez votre mot de passe');
            }
        })();
        const copy = (() => {
            switch (kind) {
                case 'reset-password':
                    return {
                        preview: tx('Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous :'),
                        welcome: tx('Bonjour,'),
                        text: tx('Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous :'),
                        button: tx('RÉINITIALISER MON MOT DE PASSE'),
                        text2: tx("Si vous n'avez pas demandé la réinitialisation de votre mot de passe, vous pouvez ignorer cet email."),
                        end: tx('Cordialement,'),
                        signature: tx("L'équipe Par Le Monde."),
                        endText: tx('Ce message a été envoyé à'),
                        endText2: tx("Si vous avez des questions ou ne souhaitez plus recevoir d'emails, "),
                        contactLink: tx('contactez-nous'),
                    } satisfies ResetPasswordTemplateProps['copy'];
            }
        })();
        const baseProps: BaseTemplateProps = {
            appUrl,
            receiverEmail: to,
            contactEmail: getContactEmail(appUrl),
        };
        const html = await render(templates[kind]({ ...baseProps, ...props, copy }));
        const text = toPlainText(html);
        await transporter.sendMail({
            from: `"Clap - Par Le Monde" <${user}>`,
            to,
            subject,
            html,
            text,
        });
    } catch (e) {
        logger.error(e);
    }
};
