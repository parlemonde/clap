import type { ProjectData } from '@server/database/schemas/projects';
import type { tFunction } from '@server/i18n/types';

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
    t: tFunction;
    qrCode?: string | null;
}
