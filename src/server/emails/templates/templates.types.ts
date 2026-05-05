import type { getTranslations } from 'next-intl/server';

export interface BaseTemplateProps {
    appUrl: string;
    receiverEmail: string;
    contactEmail: string;
    t: Awaited<ReturnType<typeof getTranslations>>;
}
