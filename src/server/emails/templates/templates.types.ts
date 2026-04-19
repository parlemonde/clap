import type { tFunction } from '@server/i18n/types';

export interface BaseTemplateProps {
    appUrl: string;
    receiverEmail: string;
    contactEmail: string;
    t: tFunction;
}
