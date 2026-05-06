import { Body, Button, Container, Font, Head, Heading, Html, Img, Link, Preview, Section, Text } from 'react-email';

import type { BaseTemplateProps } from './templates.types';

const styles = {
    body: {
        backgroundColor: '#f6f6f6',
        fontFamily: "Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        margin: '0',
        padding: '32px 12px',
    },
    container: {
        margin: '0 auto',
        maxWidth: '600px',
        width: '100%',
    },
    header: {
        backgroundColor: '#6065fc',
        borderRadius: '10px 10px 0 0',
        padding: '18px 24px',
    },
    logo: {
        display: 'block',
        height: 'auto',
        width: '300px',
    },
    content: {
        backgroundColor: '#ffffff',
        borderRadius: '0 0 10px 10px',
        padding: '30px',
    },
    heading: {
        color: '#212121',
        fontFamily: 'Tahoma, Verdana, Segoe, sans-serif',
        fontSize: '24px',
        fontWeight: '700',
        lineHeight: '1.2',
        margin: '0',
        textAlign: 'center' as const,
    },
    paragraph: {
        color: '#131313',
        fontSize: '16px',
        lineHeight: '24px',
        margin: '20px 0 0',
    },
    buttonSection: {
        padding: '20px 0',
        textAlign: 'center' as const,
    },
    button: {
        backgroundColor: '#79c3a5',
        borderRadius: '5px',
        color: '#ffffff',
        display: 'inline-block',
        fontSize: '14px',
        padding: '12px 20px',
        textDecoration: 'none',
    },
    footer: {
        color: '#131313',
        fontSize: '14px',
        lineHeight: '21px',
        margin: '30px 0 0',
        textAlign: 'center' as const,
    },
    footerLink: {
        color: '#131313',
        textDecoration: 'underline',
    },
    contactLink: {
        color: '#131313',
        fontWeight: '600',
        textDecoration: 'none',
    },
} satisfies Record<string, React.CSSProperties>;

export interface ResetPasswordTemplateProps extends BaseTemplateProps {
    token: string;
    copy: {
        preview: string;
        welcome: string;
        text: string;
        button: string;
        text2: string;
        end: string;
        signature: string;
        endText: string;
        endText2: string;
        contactLink: string;
    };
}

export function ResetPasswordTemplate({ appUrl, token, receiverEmail, contactEmail, copy }: ResetPasswordTemplateProps) {
    const logoUrl = `${appUrl}/static/images/email_header_logo.png`;

    return (
        <Html lang="fr">
            <Head />
            <Preview>{copy.preview}</Preview>
            <Font fontFamily="Roboto" fallbackFontFamily="Arial" fontWeight={400} fontStyle="normal" />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Section style={styles.header}>
                        <Link href={appUrl}>
                            <Img src={logoUrl} alt="Par Le Monde" width="300" style={styles.logo} />
                        </Link>
                    </Section>

                    <Section style={styles.content}>
                        <Heading as="h1" style={styles.heading}>
                            {copy.welcome}
                        </Heading>

                        <Text style={styles.paragraph}>{copy.text}</Text>

                        <Section style={styles.buttonSection}>
                            <Button href={`${appUrl}/update-password?verify-token=${encodeURIComponent(token)}`} style={styles.button}>
                                {copy.button}
                            </Button>
                        </Section>

                        <Text style={{ ...styles.paragraph, marginTop: '0' }}>{copy.text2}</Text>

                        <Text style={styles.paragraph}>
                            {copy.end}
                            <br />
                            {copy.signature}
                        </Text>
                    </Section>

                    <Text style={styles.footer}>
                        {copy.endText}{' '}
                        <Link href={`mailto:${receiverEmail}`} style={styles.footerLink}>
                            {receiverEmail}
                        </Link>
                        . {copy.endText2}
                        <Link href={`mailto:${contactEmail}`} style={styles.contactLink}>
                            {copy.contactLink}
                        </Link>
                        .
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

ResetPasswordTemplate.PreviewProps = {
    appUrl: 'https://clap.parlemonde.org',
    token: 'abcd',
    receiverEmail: 'eleve@example.com',
    contactEmail: 'contact@parlemonde.org',
    copy: {
        preview: 'Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous :',
        welcome: 'Bonjour,',
        text: 'Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous :',
        button: 'RÉINITIALISER MON MOT DE PASSE',
        text2: "Si vous n'avez pas demandé la réinitialisation de votre mot de passe, vous pouvez ignorer cet email.",
        end: 'Cordialement,',
        signature: "L'équipe Par Le Monde.",
        endText: 'Ce message a été envoyé à',
        endText2: "Si vous avez des questions ou ne souhaitez plus recevoir d'emails, ",
        contactLink: 'contactez-nous',
    },
};

export default ResetPasswordTemplate;
