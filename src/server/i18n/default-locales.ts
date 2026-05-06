/* eslint-disable camelcase */

import type { AbstractIntlMessages } from 'next-intl';

export const defaultLocales: AbstractIntlMessages = {
    pdf: {
        title: 'Plan de tournage',
        subtitle_description: 'Description générale :',
        theme: 'Thème :',
        scenario: 'Scénario :',
        subtitle_storyboard: 'Storyboard :',
        subtitle_tocamera: 'À votre caméra !',
        tocamera_desc: "Flashez le code QR suivant pour accéder directement à l'application et démarrer le tournage.",
    },
    email: {
        reset_password_subject: 'Réinitialisez votre mot de passe',
        welcome2: 'Bonjour,',
        reset_password: {
            text: 'Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous :',
            text_2: "Si vous n'avez pas demandé la réinitialisation de votre mot de passe, vous pouvez ignorer cet email.",
            button: 'RÉINITIALISER MON MOT DE PASSE',
        },
        end: 'Cordialement,',
        signature: "L'équipe Par Le Monde.",
        end_text: 'Ce message a été envoyé à',
        end_text_2: "Si vous avez des questions ou ne souhaitez plus recevoir d'emails, ",
        contact_link: 'contactez-nous',
    },
};
