import type { getTranslations } from 'next-intl/server';

import type { ProjectData } from '@server/database/schemas/projects';

export interface StoryboardPdfTemplateProps {
    hostUrl: string;
    currentLocale: string;
    project: ProjectData & {
        name?: string | null;
    };
    pseudo: string | null;
    scenarioDescription: string | null;
    logoFont: string;
    userLogo: string;
    t: Awaited<ReturnType<typeof getTranslations>>;
    qrCode?: string | null;
}
