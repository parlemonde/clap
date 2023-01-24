import type { Question } from './question.type';
import type { Scenario } from './scenario.type';
import type { Theme } from './theme.type';
import type { User } from './user.type';

export interface Project {
    id: number;
    title: string;
    createDate: string; // iso date string
    updateDate: string; // iso date string
    languageCode: string;
    userId: number | null;
    user?: User;
    themeId: number | string;
    theme?: Theme;
    scenarioId: number | string;
    scenario?: Scenario;
    questions?: Question[];
    // --- slideshow attributes ---
    musicBeginTime: number;
    soundUrl: string | null;
    soundVolume: number | null;
}
