import type { ProjectData } from '@server/database/schemas/projects';

export type StoryboardPdfLabels = {
    title: string;
    subtitleDescription: string;
    theme: string;
    scenario: string;
    subtitleStoryboard: string;
    subtitleToCamera: string;
    toCameraDescription: string;
};

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
    labels: StoryboardPdfLabels;
    qrCode?: string | null;
}
